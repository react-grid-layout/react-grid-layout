JAVASCRIPT_DIR := .
 
js:
	jsx $(JAVASCRIPT_DIR)/lib $(JAVASCRIPT_DIR)/build --harmony -x jsx --no-cache-dir
	cp -R ./lib/*.js ./build
