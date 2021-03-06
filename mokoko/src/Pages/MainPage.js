import React, { Component } from 'react';
import Calories from '../Components/Calories'
import MealMaker from '../Components/MealMaker'
import SimpleStorage/*, { clearStorage, resetParentState }*/ from "react-simple-storage";
import { foodDB } from '../foodDB';

const foodArray = foodDB;

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      globalFoodArray: foodArray,
      calories: null,
      caloriesLeft: null,
      breakfast: [],
      lunch: [],
      dinner: [],
    }

    this.handleInputCaloriesSubmit = this.handleInputCaloriesSubmit.bind(this);
    this.generateDayMeal = this.generateDayMeal.bind(this);
    this.generateMeal = this.generateMeal.bind(this);
    this.caloriesInput = React.createRef(); //For binding with the textInput
    this.eraseData = this.eraseData.bind(this); 
  }

  handleInputCaloriesSubmit = event => {
    event.preventDefault();
    this.setCalories(this.caloriesInput.current.value);
  }

  setCalories(cal) {
    this.setState({ calories: cal });
    this.setState({ caloriesLeft: cal });
  }

  generateDayMeal() {
    if (!this.state.calories) { // If there is no calories we cannot generate the meal
      alert('Enter calories');
    }
    else {
      this.setState({ caloriesLeft: this.state.calories });
      this.generateMeal('breakfast', 20);
      this.generateMeal('lunch', 35);
      this.generateMeal('dinner', 45);
    }
  }

  // argument: 'breakfast','lunch','dinner'
  generateMeal(meal, calorieLimit) {
    let generatedMeal = [];
    let localCaloriesLeft = this.getCaloriesLeft(calorieLimit);

    let mealFood = this.state.globalFoodArray.filter(f => f.labels.includes(meal));
    
    while (mealFood.length > 0) {
      mealFood = mealFood.filter(f => f.calories < localCaloriesLeft);
      if (mealFood.length < 1) break;
      let randomItem = this.getRandomObjectFromList(mealFood);
      
      // Add food to the meal
      if (this.isSituableForMeal(randomItem, localCaloriesLeft, generatedMeal)) {
        generatedMeal.push(randomItem);
        localCaloriesLeft -= randomItem.calories;
      }
      
      mealFood.pop(randomItem);
    } 
    
    this.setState({ [meal]: generatedMeal }); // Dynamic key [meal] = breakfast
  }
  
  getCaloriesLeft(calorieLimit) {
    return this.state.calories * (calorieLimit/100) + 10;
  }

  getRandomObjectFromList(mealFood) {
    return mealFood[Math.floor(Math.random() * mealFood.length)];
  }
  
  isSituableForMeal(randomItem, localCaloriesLeft, generatedMeal) {
    return randomItem.calories < localCaloriesLeft && 
      !generatedMeal.includes(randomItem);
  }

  updateCaloriesLeft(generatedMeal) {
    const totalCal = generatedMeal.reduce((acc, item) => {
      return acc += item.calories;
    }, 0);

    this.setState({ caloriesLeft: this.state.caloriesLeft - totalCal });
  }

  eraseData() {
    this.setState({breakfast: [], lunch: [], dinner: []});
  }

  render() {
    return (
      <div>
        <SimpleStorage
        parent={this}
        prefix={ 'MainPage' }
        />

        <h1>Meal Maker</h1>
        <Calories
          calories={this.state.calories}
          handleSubmit={this.handleInputCaloriesSubmit}
          caloriesInput={this.caloriesInput}
        />
        <button onClick={this.eraseData}>Erase</button>
        <div>
          Total Cal:
          {this.state.lunch.concat(this.state.breakfast, this.state.dinner)
            .reduce((acc, item) => {
              return acc += item.calories;
            }, 0)}
        </div>
        
        <MealMaker
          generateDayMeal={this.generateDayMeal}
          generateMeal={this.generateMeal}
          breakfast={this.state.breakfast}
          lunch={this.state.lunch}
          dinner={this.state.dinner}
        />

      </div>
    )
  }
}