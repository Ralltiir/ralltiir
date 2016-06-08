# make 默认make命令只做编译
#
default:
	fis3 release --dest=./build --root=./src/ --file=./fisconf/build.js
