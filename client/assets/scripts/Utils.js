cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    addClickEvent:function(node,target,component,handler){
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addEscEvent:function(node){
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
            },
            onKeyReleased: function(keyCode, event){
                if(keyCode == cc.KEY.back){
                    cc.vv.alert.show('提示','确定要退出游戏吗？',function(){
                        cc.game.end();
                    },true);
                }
            }
        }, node);
    },

    setFitSreenMode:function(){
        var node = cc.find('Canvas');
        var cvs = node.getComponent(cc.Canvas);
        var dw = cvs.designResolution.width;
        var dh = cvs.designResolution.height;

        // 获取实际可视区域大小
        var w, h;
        if (cc.sys.isBrowser) {
            w = window.innerWidth;
            h = window.innerHeight;
        } else {
            var size = cc.view.getFrameSize();
            w = size.width;
            h = size.height;
        }

        // 计算屏幕和设计分辨率的宽高比
        var screenRatio = w / h;
        var designRatio = dw / dh;

        // 计算缩放比例，确保画布完全显示在可视区域内
        var scale = 1;
        if (screenRatio > designRatio) {
            // 屏幕更宽（横屏），以高度为基准缩放，左右留黑边
            scale = h / dh;
        } else {
            // 屏幕更高（竖屏），以宽度为基准缩放，上下留黑边
            scale = w / dw;
        }

        // 设置 Canvas 节点的缩放
        node.scaleX = scale;
        node.scaleY = scale;

        // 禁用 Canvas 的自动适配
        cvs.fitHeight = false;
        cvs.fitWidth = false;

        // 设置页面样式
        if (cc.sys.isBrowser) {
            document.body.style.margin = '0';
            document.body.style.padding = '0';
        }

        // 设置背景色
        cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 255);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
