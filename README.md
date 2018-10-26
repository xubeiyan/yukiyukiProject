# yukiyuki Project

### 简介

> 这是一个重复发明了不知道多少遍的轮子(喂)，就是一个很传统的远程控制，不过是基于WebRTC的，和[screencat](https://github.com/maxogden/screencat)很像，但由于原作者早已抛弃了它（喂），所以我自己实现了一个

> 说到WebRTC就不得不说信令服务器，这里是使用的是自己搭建的的yukiyuki.moe:9000，没有做任何防护，请手下留情

> 另外的ICE服务器使用的Google的stun服务器，如果需要自己搭建以增加速度，可以使用[coturn](https://github.com/coturn/coturn)或者其他的ICE服务器软件

> 这里使用了`electron`作为载体，但由于没有将其写到dependency中，需要自行安装，robotjs需要重新编译成适合electron的形式，请参考[这里](https://robotjs.io/docs/electron)

### 使用方式

* 安装node依赖       
`npm install`    
* server端需要重新编译`robotjs`以适应`electron`    
* 如果没有安装过`electron`的话，需要安装，国内网络情况不是很好，请多试几次    
`npm install -g electron`

分别执行`electron .`启动客户端和服务端，将客户端生成的peerid发送给服务端，填入即可    

### 其他开源库

使用了以下开源库    
* [peerjs](https://peerjs.com/)    
* [robotjs](https://robotjs.io/) 
   
向作者表示诚挚的感谢