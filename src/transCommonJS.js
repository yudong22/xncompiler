/**
 * 负责将commonjs 中的 require define 去除
 *
 */
var requirejs = require('requirejs');

var extend = require("./util.js").extend;
var fs = require("fs");


var moduleNameSpateStr="_$_";

/**
 * 根据规则转换模块名称为变量
 * @param moduleName
 * @returns {String}
 */
function getModuleName(moduleName){
	return moduleName.replace(/\.js$/gi,"").replace("/",moduleNameSpateStr);
}
exports.getModulePath = function(namespace,moduleName){
    return moduleNameSpateStr+getModuleName(moduleName);
};

var transRequire = require("./transAMDContent").transRequire;
var transDefine = require("./transAMDContent").transDefine;
var transCallBackReq = require("./transCMDRequire").transCallBack;


/**
 * 处理Require 关键字 返回转换之后的源码
 * @param namespace
 * @param content
 * @returns code {String}
 */
function rRequire(namespace,content){
	
	return code;
}
/**
 * 处理Define 关键字 返回转换之后的源码
 * @param namespace
 * @param content
 * @returns code {String}
 */
function rDefine(namespace,content){
	return code;
}

function xnParser(){
	this._init.apply(this,arguments);
}

xnParser.prototype = {
		/**
		 * 初始化方法
		 * @param js {String} 指定入口js 文件
         * @param root {String} 指定requirejs 根路径
		 * @param options 其他的一些配置文件
		 */
		_init:function(js,root,options){
			this.rootPath = root;
            this.mainJS = js;
            this._options = extend({
                    namespacePrefix:"xnCompiler"+parseInt(100+parseInt(Math.random()*10000000)),
					rjsOptions:{},
					uglifyOptions:{}
				},options);
            this.concatDepsFile(this.mainJS,this.rootPath,this._options.rjsOptions,function(content){
                //进行uglify2 压缩
            })
		},
        readCommonFile:function(moduleName,path,contents){
            //使用uglify2 进行文件内容的转意
            //主要是讲callBack内部的require 替换成全局变量
        },
        writeCommonFile:function(moduleName,path,contents){
            //改些文件内容代码，去除外层的require 和 define
            //转意文件内容
        },
		/**
		 *  使用r.js 读取依赖分析，返回依赖的js 文件
		 * @param jsFile
		 * @param rootPath
		 * @returns depsArray {Array}
		 */
        concatDepsFile:function(jsFile,rootPath,rjsOptions,successCallBack,errorCallBack){
            var that = this;
            var rootPath = rootPath?rootPath:"static/";
            var startFile="build/tmpStart.js";
            fs.writeFile(startFile,"var define=function(){};var "+that._options.namespacePrefix+"={},"+that._options.namespacePrefix+"_cache={};",null,function(){
                var config = extend({
                    baseUrl:rootPath,
                    logLevel:0,
                    mainConfigFile: rootPath+"/require.config.js",
                    out:"build/"+jsFile,
                    //判断入口js 文件，是require 就用require,是define 就用define 进行合并
                    name:jsFile.replace(/\.js$/,""),
                    //include:[jsFile],//devConf.modulePath+"/js/index.js",
                    wrap:{
                        startFile:startFile
                        //endFile:""
                    },
                    optimize  : 'none',
                    onBuildRead : function(moduleName, path, contents){
                        var isRequire = contents.search(/require\s*\(\s*\[(.|\r\n)*\],\s*function\s*\(/gi)!=-1;
                        return transCallBackReq(that._options.namespacePrefix,contents,isRequire?null:moduleName,path);
                    },
                    onBuildWrite: function (moduleName, path, contents) {
                        //console.log(moduleName.replace("//","/"),this.include[0].replace("//","/"));
                        var isRequire = contents.search(/require\s*\(\s*\[(.|\r\n)*\],\s*function\s*\(/gi)!=-1;
                        //if(this.include[1] && moduleName.replace("//","/") == this.include[1].replace("//","/")){
                        if(isRequire){
                            return transRequire(that._options.namespacePrefix,contents);
                        }else{
                            return transDefine(that._options.namespacePrefix,moduleName,contents);
                        }

                    }
                },rjsOptions);

                requirejs.optimize(config, function (buildResponse) {
                    //buildResponse is just a text output of the modules
                    //included. Load the built file for the contents.
                    //Use config.out to get the optimized file contents.
                    var contents = fs.readFileSync(config.out, 'utf8');
                    if(successCallBack){
                        successCallBack(contents);
                    }
                    //console.log(contents);
                }, function(err) {
                    //optimization err callback
                    if(errorCallBack){
                        errorCallBack(err);
                    }else{
                        console.error(err);
                    }
                });
            });

		}
};

exports.xncompiler = function(){
    return xnParser;
};