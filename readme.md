# Hewa - Weather App

Hewa is a weather app that allows users to check the current weather conditions of different locations.

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Design](#design)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [APK Files](#apk-files)

## Features

- Display the current weather conditions in Dar es Salaam.
- Search for weather information based on location.
- Get details such as temperature, humidity, wind speed, and other relevant weather data.

## Folder Structure

The project has the following folder structure:

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Constants and configuration files
│   ├── utils/             # Utility functions and helper modules
│   ├── services/          # API services for fetching weather data
│   ├── redux/             # Redux related files (actions, reducers, store)
│   ├── layouts/           # Layout components for structuring the UI
│   ├── navigation/        # Navigation configuration
│   └── screens/           # App screens
│
├── App.js                 # Entry point of the application
├── package.json           # Project dependencies and scripts
└── ..

```

## Design

The design of the Hewa app can be accessed [here](https://www.figma.com/file/iYTa0lglZwQbvbeMFKEMR1/Weather-App?type=design&node-id=105-4726&mode=design&t=7L56UAoH9NYgIxw3-0).

## Technologies Used

- React Native
- TypeScript
- Redux
- React Navigation
- Moment.js
- React Native Paper
- Prettier (for code formatting)

## Installation

1. Clone the repository: `git clone https://github.com/mikenandi/hewa.git`
2. Navigate to the project directory: `cd hewa`
3. Install dependencies: `npm install` or `yarn install`

## Usage

1. Start the Metro server: `npm start` or `yarn start`
2. For Android, run: `npm run android` or `yarn android`
3. For iOS, run: `npm run ios` or `yarn ios`

## APK Files

APK files for previewing the app can be found in the [App Releases](releases/) folder. Please download the appropriate APK file based on your device's architecture.
