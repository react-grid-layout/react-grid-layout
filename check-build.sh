#!/bin/bash

ALL=$(cat build/*.js)
make js
COMPARE=$(cat build/*.js)
if [ "$ALL" != "$COMPARE" ]; then
	echo -e "\nERROR: The build must be run before committing! It has been run for you. Please add the files to the commit.\n";
	exit 1;
fi;
