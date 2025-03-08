import { StyleSheet, Text, View, FlatList, Image, useWindowDimensions, Animated, TouchableOpacity } from 'react-native'
import React, {useState, useRef, useEffect} from 'react'
import Svg, {G, Circle} from 'react-native-svg';
import { AntDesign } from '@expo/vector-icons';
import * as firebase from '../assets/Firebase';

const slides = [
    {
        id: 1,
        title: 'Welcome to TELR',
        description: 'This app will help you keep track of your expenses and manage your budget',
        image: require('../assets/logo_trans.png')
    },
    {
        id: 2,
        title: 'Add Transactions',
        description: 'Add your transactions and categorize them to keep track of your spending',
        image: require('../assets/onboarding2.png')
    },
    {
        id: 3,
        title: 'View Statistics',
        description: 'View your spending habits and see where you can cut back',
        image: require('../assets/onboarding3.png')
    },   
]
const NextButton = ({percentage, scrollTo}) => {    
    const size = 128;
    const strokeWidth = 2;
    const center = size / 2; 
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const progressAnimation = useRef(new Animated.Value(0)).current;
    const progressRef = useRef(null);

    const animation = (toValue) => {
        return Animated.timing(progressAnimation, {
            toValue,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }

    useEffect(() => {
        animation(percentage);
    },[percentage])

    useEffect(() => {
        progressAnimation.addListener((value) => {
            const strokeDashoffset = circumference - (circumference * value.value) / 100;
            if (progressRef?.current) {
                progressRef.current.setNativeProps({
                    strokeDashoffset,
                })
            }
        }, [percentage])
        return () => {
            progressAnimation.removeAllListeners();
        }
    }, [])
    return (
        <View style = {styles.nextButtonContainer}>
            <Svg width = {size} height = {size}>
                <G rotation = {-90} origin = {center}>
                <Circle stroke = "#E6E7E8" cx = {center} cy = {center} r = {radius} strokeWidth = {strokeWidth} fill = "transparent"/>
                <Circle
                ref = {progressRef}
                stroke = "#EDBB68"
                cx = {center}
                cy = {center}
                r = {radius}
                strokeWidth = {strokeWidth}
                strokeDasharray = {circumference}
                
                fill = "transparent"
                />
                </G>
            </Svg>
            <TouchableOpacity style = {styles.button} activeOpacity={0.6} onPress = {scrollTo}>
                <AntDesign name = 'arrowright' size = {32} color = '#fff' />
            </TouchableOpacity>
        </View>
    )
}
const Paginator = ({data, scrollX}) => {
    const {width} = useWindowDimensions();
   return (
    <View style = {{flexDirection: 'row', height: 64}}>
        {data.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 20, 10],
                extrapolate: 'clamp'
            })

            const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp'
            })
            return <Animated.View style = {[styles.dot, {width: dotWidth, opacity}]} key = {i.toString()}/>
        })}
    </View>
   )
}
const OnboardingItem = ({item}) => {
    const {width} = useWindowDimensions();
    
    return (
        <View style = {[styles.container, {width}]}>
            <Image source = {item.image} style = {[styles.image, {width: width - 150, resizeMode: 'contain'}]} />
            <View style = {{flex: 0.3}}>
                <Text style = {styles.title}>{item.title}</Text>
                <Text style = {styles.description}>{item.description}</Text>
            </View>
        </View>
    )
}
const Onboarding = ({navigation, setShowOnboarding}) => {
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const viewableItemsChanged = useRef(({viewableItems}) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;
    const slidesRef = useRef(null);
    const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
          slidesRef.current.scrollToIndex({index: currentIndex + 1});
        } else {
          setShowOnboarding(false); // This will take them to MainApp
        }
      };
  return (
    <View style = {styles.container}>
        <View style = {{flex: 3}}>
        <FlatList data = {slides} renderItem = {({item}) => <OnboardingItem item = {item} />} 
        horizontal
        pagingEnabled
        bounces = {false}
        keyExtractor={(item) => item.id}
        onScroll = {Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {useNativeDriver: false})}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig} 
        scrollEventThrottle={32}
        ref = {slidesRef}
        showsHorizontalScrollIndicator = {false}
        />
        </View>
        <Paginator data = {slides} scrollX = {scrollX} />
        <NextButton percentage = {(currentIndex + 1) * (100 / slides.length)} scrollTo = {scrollTo}/>
    </View>
  )
}

export default Onboarding

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        },
    image: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '800',
        fontSize: 28,
        marginBottom: 10,
        color: '#493d8a',
        textAlign: 'center',
    },
    description: {
        fontWeight: '300',
        color: '#62656b',
        textAlign: 'center',
        paddingHorizontal: 64,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#493d8a',
        marginHorizontal: 8,
    },
    nextButtonContainer: {  // Add this new style
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {  // Add this new style
        position: 'absolute',
        backgroundColor: '#EDBB68',  // or whatever color you want for the button circle
        borderRadius: 100,
        padding: 20,
    },
})