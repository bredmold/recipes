# Recipe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Build for deploy

Run `ng build:prod` to build the production version of the project.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running pre-build tests

Run `ng test:once` to execute the unit tests a single time using a headless browser.

## Deploying to S3

Run `./scripts/upload.sh`. This will do the following:
* Run unit tests
* Build the prod version of the application
* Copy artifacts to S3

After this, you will be able to visit the application at: https://recipe-hosting.s3.us-west-2.amazonaws.com/index.html

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## TODO List

* Recipe viewer
  * Layout for phone
  * Portrait layout for iPad
* Steps description should support Markdown
* Input validation
  * Prevent negative quantities
  * Prevent empty ingredient names
* US/metric quantity conversions
* Edit descriptions for ingredients
* Show descriptions for ingredients in recipe viewer
* Drag & drop list re-ordering
  * steps
  * ingredients
* Recipe picker hover highlight color should use theme colors
* Better step editor layout
* Recipe editor should be able to select tabs via URL
* Recipe doubling
* Export recipes
* Search by ingredients
* Delete recipe button
* Improve Home Component layout
* Factor out commonalities from recipe picker and home component
* Cognito authentication
  * Testing
