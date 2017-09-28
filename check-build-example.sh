#!/bin/bash

ALL=$(cat dist/*.js examples/*.html)
npm run build-example
COMPARE=$(cat dist/*.js examples/*.html)
if [ "$ALL" != "$COMPARE" ]; then
   echo -e "\nERROR: The build must be run before committing! It has been run for you. Please add the files to the commit.\n";
   exit 1;
else
   echo -e "\nBuild is up to date, continuing commit...\n"        
fi;
