var roomMgr = require("./roommgr");
var userMgr = require("./usermgr");
var mjutils = require('./mjutils');
var db = require("../utils/db");
var crypto = require("../utils/crypto");
var games = {};
var gamesIdBase = 0;

var ACTION_CHUPAI = 1;
var ACTION_MOPAI = 2;
var ACTION_PENG = 3;
var ACTION_GANG = 4;
var ACTION_HU = 5;
var ACTION_ZIMO = 6;

var gameSeatsOfUsers = {};

function getMJType(id){
    if(id >= 0 && id < 9){
        return 0;
    }
    else if(id >= 9 && id < 18){
        return 1;
    }
    else if(id >= 18 && id < 27){
        return 2;
    }
}

function shuffle(game) {
    var mahjongs = game.mahjongs;
    var index = 0;
    for(var i = 0; i < 9; ++i){
        for(var c = 0; c < 4; ++c){
            mahjongs[index] = i;
            index++;
        }
    }
    for(var i = 9; i < 18; ++i){
        for(var c = 0; c < 4; ++c){
            mahjongs[index] = i;
            index++;
        }
    }
    for(var i = 18; i < 27; ++i){
        for(var c = 0; c < 4; ++c){
            mahjongs[index] = i;
            index++;
        }
    }
    for(var i = 0; i < mahjongs.length; ++i){
        var lastIndex = mahjongs.length - 1 - i;
        var index = Math.floor(Math.random() * lastIndex);
        var t = mahjongs[index];
        mahjongs[index] = mahjongs[lastIndex];
        mahjongs[lastIndex] = t;
    }
}

function mopai(game,seatIndex) {
    if(game.currentIndex == game.mahjongs.length){
        return -1;
    }
    var data = game.gameSeats[seatIndex];
    var mahjongs = data.holds;
    var pai = game.mahjongs[game.currentIndex];
    mahjongs.push(pai);
    var c = data.countMap[pai];
    if(c == null) {
        c = 0;
    }
    data.countMap[pai] = c + 1;
    game.currentIndex ++;
    return pai;
}

function deal(game){
    game.currentIndex = 0;
    var seatIndex = game.button;
    for(var i = 0; i < 52; ++i){
        var mahjongs = game.gameSeats[seatIndex].holds;
        if(mahjongs == null){
            mahjongs = [];
            game.gameSeats[seatIndex].holds = mahjongs;
        }
        mopai(game,seatIndex);
        seatIndex ++;
        seatIndex %= 4;
    }
    mopai(game,game.button);
    game.turn = game.button;
}

function checkCanPeng(game,seatData,targetPai) {
    if(getMJType(targetPai) == seatData.que){
        return;
    }
    var count = seatData.countMap[targetPai];
    if(count != null && count >= 2){
        seatData.canPeng = true;
    }
}

function checkCanDianGang(game,seatData,targetPai){
    if(game.mahjongs.length <= game.currentIndex){
        return;
    }
    if(getMJType(targetPai) == seatData.que){
        return;
    }
    var count = seatData.countMap[targetPai];
    if(count != null && count >= 3){
        seatData.canGang = true;
        seatData.gangPai.push(targetPai);
        return;
    }
}

function checkCanAnGang(game,seatData){
    if(game.mahjongs.length <= game.currentIndex){
        return;
    }
    for(var key in seatData.countMap){
        var pai = parseInt(key);
        if(getMJType(pai) != seatData.que){
            var c = seatData.countMap[key];
            if(c != null && c == 4){
                seatData.canGang = true;
                seatData.gangPai.push(pai);
            }
        }
    }
}

function checkCanWanGang(game,seatData){
    if(game.mahjongs.length <= game.currentIndex){
        return;
    }
    for(var i = 0; i < seatData.pengs.length; ++i){
        var pai = seatData.pengs[i];
        if(seatData.countMap[pai] == 1){
            seatData.canGang = true;
            seatData.gangPai.push(pai);
        }
    }
}

function checkCanHu(game,seatData,targetPai) {
    game.lastHuPaiSeat = -1;
    if(getMJType(targetPai) == seatData.que){
        return;
    }
    seatData.canHu = false;
    for(var k in seatData.tingMap){
        if(targetPai == k){
            seatData.canHu = true;
        }
    }
}

function clearAllOptions(game,seatData){
    var fnClear = function(sd){
        sd.canPeng = false;
        sd.canGang = false;
        sd.gangPai = [];
        sd.canHu = false;
        sd.lastFangGangSeat = -1;    
    }
    if(seatData){
        fnClear(seatData);
    }
    else{
        game.qiangGangContext = null;
        for(var i = 0; i < game.gameSeats.length; ++i){
            fnClear(game.gameSeats[i]);
        }
    }
}

function checkCanTingPai(game,seatData){
    seatData.tingMap = {};
    
    for(var i = 0; i < seatData.holds.length; ++i){
        var pai = seatData.holds[i];
        if(getMJType(pai) == seatData.que){
            return;
        }   
    }

    if(seatData.que != 0){
        mjutils.checkTingPai(seatData,0,9);        
    }
    if(seatData.que != 1){
        mjutils.checkTingPai(seatData,9,18);        
    }
    if(seatData.que != 2){
        mjutils.checkTingPai(seatData,18,27);        
    }
}

function getSeatIndex(userId){
    var seatIndex = roomMgr.getUserSeat(userId);
    if(seatIndex == null){
        return null;
    }
    return seatIndex;
}

function getGameByUserID(userId){
    var roomId = roomMgr.getUserRoom(userId);
    if(roomId == null){
        return null;
    }
    var game = games[roomId];
    return game;
}

function hasOperations(seatData){
    if(seatData.canGang || seatData.canPeng || seatData.canHu){
        return true;
    }
    return false;
}

function sendOperations(game,seatData,pai) {
    if(hasOperations(seatData)){
        if(pai == -1){
            pai = seatData.holds[seatData.holds.length - 1];
        }
        
        var data = {
            pai:pai,
            hu:seatData.canHu,
            peng:seatData.canPeng,
            gang:seatData.canGang,
            gangpai:seatData.gangPai
        };
        userMgr.sendMsg(seatData.userId,'game_action_push',data);
        data.si = seatData.seatIndex;
    }
    else{
        userMgr.sendMsg(seatData.userId,'game_action_push');
    }
}

function moveToNextUser(game,nextSeat){
    game.fangpaoshumu = 0;
    if(nextSeat == null){
        game.turn ++;
        game.turn %= 4;
        return;
    }
    else{
        game.turn = nextSeat;
    }
}

function doUserMoPai(game){
    game.chuPai = -1;
    var turnSeat = game.gameSeats[game.turn];
    turnSeat.lastFangGangSeat = -1;
    turnSeat.guoHuFan = -1;
    var pai = mopai(game,game.turn);
    if(pai == -1){
        doGameOver(game,turnSeat.userId);
        return;
    }
    else{
        var numOfMJ = game.mahjongs.length - game.currentIndex;
        userMgr.broacastInRoom('mj_count_push',numOfMJ,turnSeat.userId,true);
    }

    recordGameAction(game,game.turn,ACTION_MOPAI,pai);
    userMgr.sendMsg(turnSeat.userId,'game_mopai_push',pai);
    if(!turnSeat.hued){
        checkCanAnGang(game,turnSeat);    
    }
    if(!turnSeat.hued || turnSeat.holds[turnSeat.holds.length-1] == pai){
        checkCanWanGang(game,turnSeat,pai);    
    }
    checkCanHu(game,turnSeat,pai);
    turnSeat.canChuPai = true;
    userMgr.broacastInRoom('game_chupai_push',turnSeat.userId,turnSeat.userId,true);
    sendOperations(game,turnSeat,game.chuPai);
}

function isSameType(type,arr){
    for(var i = 0; i < arr.length; ++i){
        var t = getMJType(arr[i]);
        if(type != -1 && type != t){
            return false;
        }
        type = t;
    }
    return true; 
}

function isQingYiSe(gameSeatData){
    var type = getMJType(gameSeatData.holds[0]);
    if(isSameType(type,gameSeatData.holds) == false){
        return false;
    }
    if(isSameType(type,gameSeatData.angangs) == false){
        return false;
    }
    if(isSameType(type,gameSeatData.wangangs) == false){
        return false;
    }
    if(isSameType(type,gameSeatData.diangangs) == false){
        return false;
    }
    if(isSameType(type,gameSeatData.pengs) == false){
        return false;
    }
    return true;
}

function isMenQing(gameSeatData){
    return (gameSeatData.pengs.length + gameSeatData.wangangs.length + gameSeatData.diangangs.length) == 0;
}

function isZhongZhang(gameSeatData){
    var fn = function(arr){
        for(var i = 0; i < arr.length; ++i){
            var pai = arr[i];
            if(pai == 0 || pai == 8 || pai == 9 || pai == 17 || pai == 18 || pai == 26){
                return false;
            }
        }
        return true;
    }
    
    if(fn(gameSeatData.pengs) == false){
        return false;
    }
    if(fn(gameSeatData.angangs) == false){
        return false;
    }
    if(fn(gameSeatData.diangangs) == false){
        return false;
    }
    if(fn(gameSeatData.wangangs) == false){
        return false;
    }
    if(fn(gameSeatData.holds) == false){
        return false;
    }
    return true;
}

function isTinged(seatData){
    for(var k in seatData.tingMap){
        return true;
    }
    return false;
}

function computeFanScore(game,fan){
    if(fan > game.conf.maxFan){
        fan = game.conf.maxFan;
    }
    return (1 << fan) * game.conf.baseScore;
}

function needChaDaJiao(game){
    var numOfHued = 0;
    var numOfTinged = 0;
    var numOfUntinged = 0;
    for(var i = 0; i < game.gameSeats.length; ++i){
        var ts = game.gameSeats[i];
        if(ts.hued){
            numOfHued ++;
            numOfTinged++;
        }
        else if(isTinged(ts)){
            numOfTinged++;
        }
        else{
            numOfUntinged++;
        }
    }
    if(numOfTinged == 0){
        return false;
    }
    if(numOfUntinged == 0){
        return false;
    }
    return true;
}

function findMaxFanTingPai(ts){
    var cur = null;
    for(var k in ts.tingMap){
        var tpai = ts.tingMap[k];
        if(cur == null || tpai.fan > cur.fan){
            cur = tpai;
            cur.pai = parseInt(k);
        }
    }
    return cur;
}

function findUnTingedPlayers(game){
    var arr = [];
    for(var i = 0; i < game.gameSeats.length; ++i){
        var ts = game.gameSeats[i];
        if(!ts.hued && !isTinged(ts)){
            arr.push(i);
        }
    }
    return arr;
}

function getNumOfGen(seatData){
    var numOfGangs = seatData.diangangs.length + seatData.wangangs.length + seatData.angangs.length;
    for(var k = 0; k < seatData.pengs.length; ++k){
        var pai = seatData.pengs[k];
        if(seatData.countMap[pai] == 1){
            numOfGangs++;
        }
    }
    for(var k in seatData.countMap){
        if(seatData.countMap[k] == 4){
            numOfGangs++;
        }
    }
    return numOfGangs;
}

function chaJiao(game){
    var arr = findUnTingedPlayers(game);
    if(arr.length == 0){
        return;
    }
    for(var i = 0; i < game.gameSeats.length; ++i){
        var ts = game.gameSeats[i];
        if(isTinged(ts)){
            var cur = findMaxFanTingPai(ts);
            ts.huInfo.push({
               ishupai:true,
               action:"chadajiao",
               fan:cur.fan,
               pattern:cur.pattern,
               pai:cur.pai,
               numofgen:getNumOfGen(ts),
            });
            
            for(var j = 0; j < arr.length; ++j){
                game.gameSeats[arr[j]].huInfo.push({
                    action:"beichadajiao",
                    target:i,
                    index:ts.huInfo.length-1,
                });
            }
        }
    }
}

function getKanShu(pai){
    return (pai % 9) + 1;
}

function calculateResult(game,roomInfo){
    for(var i = 0; i < game.gameSeats.length; ++i){
        var sd = game.gameSeats[i];
        sd.numAnGang = sd.angangs.length;
        sd.numMingGang = sd.wangangs.length + sd.diangangs.length;
        
        for(var j = 0; j < sd.huInfo.length; ++j){
            var info = sd.huInfo[j];
            if(!info.ishupai){
                sd.numDianPao++;
                continue;
            }
            
            var hupai = info.pai;
            var kanshu = getKanShu(hupai);
            info.kanshu = kanshu;
            
            if(info.iszimo){
                var totalWin = 0;
                for(var t = 0; t < game.gameSeats.length; ++t){
                    if(t != i){
                        var loser = game.gameSeats[t];
                        var pay = kanshu * 2;
                        if(loser.score < pay){
                            pay = loser.score;
                        }
                        if(pay > 0){
                            loser.score -= pay;
                            totalWin += pay;
                        }
                    }
                }
                sd.score += totalWin;
                sd.numZiMo++;
            }
            else{
                var paoshou = game.gameSeats[info.target];
                var paoshouPay = kanshu * 2;
                if(paoshou.score < paoshouPay){
                    paoshouPay = paoshou.score;
                }
                if(paoshouPay > 0){
                    paoshou.score -= paoshouPay;
                    sd.score += paoshouPay;
                }
                
                for(var t = 0; t < game.gameSeats.length; ++t){
                    if(t != i && t != info.target){
                        var loser = game.gameSeats[t];
                        var pay = kanshu;
                        if(loser.score < pay){
                            pay = loser.score;
                        }
                        if(pay > 0){
                            loser.score -= pay;
                            sd.score += pay;
                        }
                    }
                }
                sd.numJiePao++;
            }
            
            info.fan = kanshu;
        }
    }
}

function doGameOver(game,userId,forceEnd){
    var roomId = roomMgr.getUserRoom(userId);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    var results = [];
    var dbresult = [0,0,0,0];
    
    var fnNoticeResult = function(isEnd){
        var endinfo = null;
        if(isEnd){
            endinfo = [];
            for(var i = 0; i < roomInfo.seats.length; ++i){
                var rs = roomInfo.seats[i];
                endinfo.push({
                    numzimo:rs.numZiMo,
                    numjiepao:rs.numJiePao,
                    numdianpao:rs.numDianPao,
                    numangang:rs.numAnGang,
                    numminggang:rs.numMingGang,
                    numchadajiao:rs.numChaJiao, 
                });
            }   
        }
        
        userMgr.broacastInRoom('game_over_push',{results:results,endinfo:endinfo},userId,true);
        if(isEnd){
            setTimeout(function(){
                if(roomInfo.numOfGames > 1){
                    store_history(roomInfo);    
                }
                userMgr.kickAllInRoom(roomId);
                roomMgr.destroy(roomId);
                db.archive_games(roomInfo.uuid);            
            },1500);
        }
    }

    if(game != null){
        if(!forceEnd){
            calculateResult(game,roomInfo);    
        }

        for(var i = 0; i < roomInfo.seats.length; ++i){
            var rs = roomInfo.seats[i];
            var sd = game.gameSeats[i];

            rs.ready = false;
            rs.score = sd.score;
            rs.numZiMo += sd.numZiMo;
            rs.numJiePao += sd.numJiePao;
            rs.numDianPao += sd.numDianPao;
            rs.numAnGang += sd.numAnGang;
            rs.numMingGang += sd.numMingGang;
            rs.numChaJiao += sd.numChaJiao;
            
            var userRT = {
                userId:sd.userId,
                actions:[],
                pengs:sd.pengs,
                wangangs:sd.wangangs,
                diangangs:sd.diangangs,
                angangs:sd.angangs,
                holds:sd.holds,
                score:sd.score,
                totalscore:rs.score,
                huinfo:sd.huInfo,                
            }
            
            for(var k in sd.actions){
                userRT.actions[k] = {
                    type:sd.actions[k].type,
                };
            }
            results.push(userRT);

            dbresult[i] = sd.score;
            delete gameSeatsOfUsers[sd.userId];
        }
        delete games[roomId];

        var old = roomInfo.nextButton;
        var bankerWon = false;
        for(var i = 0; i < game.gameSeats.length; ++i){
            if(game.gameSeats[i].hued && i == game.button){
                bankerWon = true;
                break;
            }
        }
        
        if(bankerWon){
            //庄家赢牌连庄
        }
        else if(game.firstHupai >= 0){
            roomInfo.nextButton = game.firstHupai;
        }
        else{
            roomInfo.nextButton = (game.button + 1) % 4;
        }

        if(old != roomInfo.nextButton){
            db.update_next_button(roomId,roomInfo.nextButton);
        }
    }
    
    if(forceEnd || game == null){
        fnNoticeResult(true);   
    }
    else{
        store_game(game,function(ret){
            db.update_game_result(roomInfo.uuid,game.gameIndex,dbresult);
            var str = JSON.stringify(game.actionList);
            db.update_game_action_records(roomInfo.uuid,game.gameIndex,str); 
            db.update_num_of_turns(roomId,roomInfo.numOfGames);
            if(roomInfo.numOfGames == 1){
                var cost = 2;
                if(roomInfo.conf.maxGames == 8){
                    cost = 3;
                }
                db.cost_gems(game.gameSeats[0].userId,cost);
            }

            var isEnd = (roomInfo.numOfGames >= roomInfo.conf.maxGames);
            fnNoticeResult(isEnd);
        });            
    }
}

function recordUserAction(game,seatData,type,target){
    var d = {type:type,targets:[]};
    if(target != null){
        if(typeof(target) == 'number'){
            d.targets.push(target);    
        }
        else{
            d.targets = target;
        }
    }
    else{
        for(var i = 0; i < game.gameSeats.length; ++i){
            var s = game.gameSeats[i];
            if(i != seatData.seatIndex){
                d.targets.push(i);
            }
        }        
    }

    seatData.actions.push(d);
    return d;
}

function recordGameAction(game,si,action,pai){
    game.actionList.push(si);
    game.actionList.push(action);
    if(pai != null){
        game.actionList.push(pai);
    }
}

exports.setReady = function(userId,callback){
    var roomId = roomMgr.getUserRoom(userId);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    roomMgr.setReady(userId,true);

    var game = games[roomId];
    if(game == null){
        if(roomInfo.seats.length == 4){
            for(var i = 0; i < roomInfo.seats.length; ++i){
                var s = roomInfo.seats[i];
                if(s.ready == false || userMgr.isOnline(s.userId)==false){
                    return;
                }
            }
            exports.begin(roomId);
        }
    }
    else{
        var numOfMJ = game.mahjongs.length - game.currentIndex;
        var remainingGames = roomInfo.conf.maxGames - roomInfo.numOfGames;

        var data = {
            state:game.state,
            numofmj:numOfMJ,
            button:game.button,
            turn:game.turn,
            chuPai:game.chuPai,
        };

        data.seats = [];
        var seatData = null;
        for(var i = 0; i < 4; ++i){
            var sd = game.gameSeats[i];

            var s = {
                userid:sd.userId,
                folds:sd.folds,
                angangs:sd.angangs,
                diangangs:sd.diangangs,
                wangangs:sd.wangangs,
                pengs:sd.pengs,
                que:sd.que,
                hued:sd.hued,
                huinfo:sd.huInfo,
                iszimo:sd.iszimo,
            }
            if(sd.userId == userId){
                s.holds = sd.holds;
                s.huanpais = sd.huanpais;
                seatData = sd;
            }
            else{
                s.huanpais = sd.huanpais? []:null;
            }
            data.seats.push(s);
        }

        userMgr.sendMsg(userId,'game_sync_push',data);
        sendOperations(game,seatData,game.chuPai);
    }
}

function store_single_history(userId,history){
    db.get_user_history(userId,function(data){
        if(data == null){
            data = [];
        }
        while(data.length >= 10){
            data.shift();
        }
        data.push(history);
        db.update_user_history(userId,data);
    });
}

function store_history(roomInfo){
    var seats = roomInfo.seats;
    var history = {
        uuid:roomInfo.uuid,
        id:roomInfo.id,
        time:roomInfo.createTime,
        seats:new Array(4)
    };

    for(var i = 0; i < seats.length; ++i){
        var rs = seats[i];
        var hs = history.seats[i] = {};
        hs.userid = rs.userId;
        hs.name = crypto.toBase64(rs.name);
        hs.score = rs.score;
    }

    for(var i = 0; i < seats.length; ++i){
        var s = seats[i];
        store_single_history(s.userId,history);
    }
}


function construct_game_base_info(game){
    var baseInfo = {
        type:game.conf.type,
        button:game.button,
        index:game.gameIndex,
        mahjongs:game.mahjongs,
        game_seats:new Array(4)
    }
    for(var i = 0; i < 4; ++i){
        baseInfo.game_seats[i] = game.gameSeats[i].holds;
    }
    game.baseInfoJson = JSON.stringify(baseInfo);
}

function store_game(game,callback){
    db.create_game(game.roomInfo.uuid,game.gameIndex,game.baseInfoJson,callback);
}

exports.begin = function(roomId) {
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }
    var seats = roomInfo.seats;

    var game = {
        conf:roomInfo.conf,
        roomInfo:roomInfo,
        gameIndex:roomInfo.numOfGames,

        button:roomInfo.nextButton,
        mahjongs:new Array(108),
        currentIndex:0,
        gameSeats:new Array(4),

        numOfQue:0,
        turn:0,
        chuPai:-1,
        state:"idle",
        firstHupai:-1,
        yipaoduoxiang:-1,
        fangpaoshumu:-1,
        actionList:[],
        chupaiCnt:0,
    };

    roomInfo.numOfGames++;

    for(var i = 0; i < 4; ++i){
        var data = game.gameSeats[i] = {};

        data.game = game;
        data.seatIndex = i;
        data.userId = seats[i].userId;
        data.holds = [];
        data.folds = [];
        data.angangs = [];
        data.diangangs = [];
        data.wangangs = [];
        data.pengs = [];
        data.que = -1;
        data.huanpais = null;
        data.countMap = {};
        data.tingMap = {};
        data.pattern = "";
        data.canGang = false;
        data.gangPai = [];
        data.canPeng = false;
        data.canHu = false;
        data.canChuPai = false;
        data.guoHuFan = -1;
        data.hued = false;
        data.actions = [];
        data.iszimo = false;
        data.isGangHu = false;
        data.fan = 0;
        data.score = seats[i].score;
        data.huInfo = [];
        data.lastFangGangSeat = -1;
        data.numZiMo = 0;
        data.numJiePao = 0;
        data.numDianPao = 0;
        data.numAnGang = 0;
        data.numMingGang = 0;
        data.numChaJiao = 0;

        gameSeatsOfUsers[data.userId] = data;
    }
    games[roomId] = game;
    shuffle(game);
    deal(game);

    var numOfMJ = game.mahjongs.length - game.currentIndex;
    var huansanzhang = roomInfo.conf.hsz;

    for(var i = 0; i < seats.length; ++i){
        var s = seats[i];
        userMgr.sendMsg(s.userId,'game_holds_push',game.gameSeats[i].holds);
        userMgr.sendMsg(s.userId,'mj_count_push',numOfMJ);
        userMgr.sendMsg(s.userId,'game_num_push',roomInfo.numOfGames);
        userMgr.sendMsg(s.userId,'game_begin_push',game.button);

        if(huansanzhang == true){
            game.state = "huanpai";
            userMgr.sendMsg(s.userId,'game_huanpai_push');
        }
        else{
            game.state = "dingque";
            userMgr.sendMsg(s.userId,'game_dingque_push');
        }
    }
};

exports.huanSanZhang = function(userId,p1,p2,p3){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var game = seatData.game;
    if(game.state != "huanpai"){
        console.log("can't recv huansanzhang when game.state == " + game.state);
        return;
    }

    if(seatData.huanpais != null){
        console.log("player has done this action.");
        return;
    }

    if(seatData.countMap[p1] == null || seatData.countMap[p1] == 0){
        return;
    }
    seatData.countMap[p1]--;

    if(seatData.countMap[p2] == null || seatData.countMap[p2] == 0){
        seatData.countMap[p1]++;
        return;
    }
    seatData.countMap[p2]--;

    if(seatData.countMap[p3] == null || seatData.countMap[p3] == 0){
        seatData.countMap[p1]++;
        seatData.countMap[p2]++;
        return;
    }

    seatData.countMap[p1]++;
    seatData.countMap[p2]++;

    seatData.huanpais = [p1,p2,p3];
    
    for(var i = 0; i < seatData.huanpais.length; ++i){
        var p = seatData.huanpais[i];
        var idx = seatData.holds.indexOf(p);
        seatData.holds.splice(idx,1);
        seatData.countMap[p] --;
    }
    userMgr.sendMsg(seatData.userId,'game_holds_push',seatData.holds);
    
    for(var i = 0; i < game.gameSeats.length; ++i){
        var sd = game.gameSeats[i];
        if(sd == seatData){
            var rd = {
                si:seatData.userId,
                huanpais:seatData.huanpais
            };
            userMgr.sendMsg(sd.userId,'huanpai_notify',rd);            
        }
        else{
            var rd = {
                si:seatData.userId,
                huanpais:[]
            };
            userMgr.sendMsg(sd.userId,'huanpai_notify',rd);
        }
    }

    for(var i = 0; i < game.gameSeats.length; ++i){
        if(game.gameSeats[i].huanpais == null){
            return;
        }
    }

    var fn = function(s1,huanjin){
        for(var i = 0; i < huanjin.length; ++i){
            var p = huanjin[i];
            s1.holds.push(p);
            if(s1.countMap[p] == null){
                s1.countMap[p] = 0;    
            }
            s1.countMap[p] ++;
        }
    }

    var f = Math.random();
    var s = game.gameSeats;
    var huanpaiMethod = 0;
    if(f < 0.33){
        fn(s[0],s[2].huanpais);
        fn(s[1],s[3].huanpais);
        fn(s[2],s[0].huanpais);
        fn(s[3],s[1].huanpais);
        huanpaiMethod = 0;
    }
    else if(f < 0.66){
        fn(s[0],s[1].huanpais);
        fn(s[1],s[2].huanpais);
        fn(s[2],s[3].huanpais);
        fn(s[3],s[0].huanpais);
        huanpaiMethod = 1;
    }
    else{
        fn(s[0],s[3].huanpais);
        fn(s[1],s[0].huanpais);
        fn(s[2],s[1].huanpais);
        fn(s[3],s[2].huanpais);
        huanpaiMethod = 2;
    }
    
    var rd = {
        method:huanpaiMethod,
    }
    game.huanpaiMethod = huanpaiMethod;    

    game.state = "dingque";
    for(var i = 0; i < s.length; ++i){
        var userId = s[i].userId;
        userMgr.sendMsg(userId,'game_huanpai_over_push',rd);
        userMgr.sendMsg(userId,'game_holds_push',s[i].holds);
        userMgr.sendMsg(userId,'game_dingque_push');
    }
};

exports.dingQue = function(userId,type){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var game = seatData.game;
    if(game.state != "dingque"){
        console.log("can't recv dingQue when game.state == " + game.state);
        return;
    }

    if(seatData.que < 0){
        game.numOfQue++;    
    }

    seatData.que = type;

    if(game.numOfQue == 4){
        construct_game_base_info(game);
        
        var arr = [1,1,1,1];
        for(var i = 0; i < game.gameSeats.length; ++i){
            arr[i] = game.gameSeats[i].que;
        }
        userMgr.broacastInRoom('game_dingque_finish_push',arr,seatData.userId,true);
        userMgr.broacastInRoom('game_playing_push',null,seatData.userId,true);

        for(var i = 0; i < game.gameSeats.length; ++i){
            var duoyu = -1;
            var gs = game.gameSeats[i];
            if(gs.holds.length == 14){
                duoyu = gs.holds.pop();
                gs.countMap[duoyu] -= 1;
            }
            checkCanTingPai(game,gs);
            if(duoyu >= 0){
                gs.holds.push(duoyu);
                gs.countMap[duoyu] ++;
            }
        }
        
        var turnSeat = game.gameSeats[game.turn];
        game.state = "playing";
        turnSeat.canChuPai = true;
        userMgr.broacastInRoom('game_chupai_push',turnSeat.userId,turnSeat.userId,true);
        checkCanAnGang(game,turnSeat);
        checkCanHu(game,turnSeat,turnSeat.holds[turnSeat.holds.length - 1]);
        sendOperations(game,turnSeat,game.chuPai);
    }
    else{
        userMgr.broacastInRoom('game_dingque_notify_push',seatData.userId,seatData.userId,true);
    }
};

exports.chuPai = function(userId,pai){

    pai = Number.parseInt(pai);
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var game = seatData.game;
    var seatIndex = seatData.seatIndex;
    if(game.turn != seatData.seatIndex){
        console.log("not your turn.");
        return;
    }

    if(seatData.canChuPai == false){
        console.log('no need chupai.');
        return;
    }

    if(hasOperations(seatData)){
        console.log('plz guo before you chupai.');
        return;
    }
    
    if(seatData.hued){
        if(seatData.holds[seatData.holds.length - 1] != pai){
            console.log('only deal last one when hued.');
            return;
        }
    }

    var index = seatData.holds.indexOf(pai);
    if(index == -1){
        console.log("holds:" + seatData.holds);
        console.log("can't find mj." + pai);
        return;
    }
    
    seatData.canChuPai = false;
    game.chupaiCnt ++;
    seatData.guoHuFan = -1;
    
    seatData.holds.splice(index,1);
    seatData.countMap[pai] --;
    game.chuPai = pai;
    recordGameAction(game,seatData.seatIndex,ACTION_CHUPAI,pai);
    checkCanTingPai(game,seatData);
    userMgr.broacastInRoom('game_chupai_notify_push',{userId:seatData.userId,pai:pai},seatData.userId,true);
    
    if(seatData.tingMap[game.chuPai]){
        seatData.guoHuFan = seatData.tingMap[game.chuPai].fan;
    }

    var hasActions = false;
    for(var i = 0; i < game.gameSeats.length; ++i){
        if(game.turn == i){
            continue;
        }
        var ddd = game.gameSeats[i];
        if(!ddd.hued){
            checkCanPeng(game,ddd,pai);
            checkCanDianGang(game,ddd,pai);            
        }

        checkCanHu(game,ddd,pai);
        if(seatData.lastFangGangSeat == -1){
            if(ddd.canHu && ddd.guoHuFan >= 0 && ddd.tingMap[pai].fan <= ddd.guoHuFan){
                console.log("ddd.guoHuFan:" + ddd.guoHuFan);
                ddd.canHu = false;
                userMgr.sendMsg(ddd.userId,'guohu_push');            
            }     
        }

        if(hasOperations(ddd)){
            sendOperations(game,ddd,game.chuPai);
            hasActions = true;    
        }
    }
    
    if(!hasActions){
        setTimeout(function(){
            userMgr.broacastInRoom('guo_notify_push',{userId:seatData.userId,pai:game.chuPai},seatData.userId,true);
            seatData.folds.push(game.chuPai);
            game.chuPai = -1;
            moveToNextUser(game);
            doUserMoPai(game);            
        },500);
    }
};

exports.peng = function(userId){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var game = seatData.game;

    if(game.turn == seatData.seatIndex){
        console.log("it's your turn.");
        return;
    }

    if(seatData.canPeng == false){
        console.log("seatData.peng == false");
        return;
    }

    if(seatData.hued){
        console.log('you have already hued. no kidding plz.');
        return;
    }
    
    var i = game.turn;
    while(true){
        var i = (i + 1)%4;
        if(i == game.turn){
            break;
        }
        else{
            var ddd = game.gameSeats[i];
            if(ddd.canHu && i != seatData.seatIndex){
                return;    
            }
        }
    }


    clearAllOptions(game);

    var pai = game.chuPai;
    var c = seatData.countMap[pai];
    if(c == null || c < 2){
        console.log("pai:" + pai + ",count:" + c);
        console.log(seatData.holds);
        console.log("lack of mj.");
        return;
    }

    for(var i = 0; i < 2; ++i){
        var index = seatData.holds.indexOf(pai);
        if(index == -1){
            console.log("can't find mj.");
            return;
        }
        seatData.holds.splice(index,1);
        seatData.countMap[pai] --;
    }
    seatData.pengs.push(pai);
    game.chuPai = -1;

    recordGameAction(game,seatData.seatIndex,ACTION_PENG,pai);

    userMgr.broacastInRoom('peng_notify_push',{userid:seatData.userId,pai:pai},seatData.userId,true);

    moveToNextUser(game,seatData.seatIndex);
    
    seatData.canChuPai = true;
    userMgr.broacastInRoom('game_chupai_push',seatData.userId,seatData.userId,true);
};

exports.isPlaying = function(userId){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        return false;
    }

    var game = seatData.game;

    if(game.state == "idle"){
        return false;
    }
    return true;
}

function checkCanQiangGang(game,turnSeat,seatData,pai){
    var hasActions = false;
    for(var i = 0; i < game.gameSeats.length; ++i){
        if(seatData.seatIndex == i){
            continue;
        }
        var ddd = game.gameSeats[i];
        checkCanHu(game,ddd,pai);
        if(ddd.canHu){
            sendOperations(game,ddd,pai);
            hasActions = true;
        }
    }
    if(hasActions){
        game.qiangGangContext = {
            turnSeat:turnSeat,
            seatData:seatData,
            pai:pai,
            isValid:true,
        }
    }
    else{
        game.qiangGangContext = null;
    }
    return game.qiangGangContext != null;
}

function doGang(game,turnSeat,seatData,gangtype,numOfCnt,pai){
    var seatIndex = seatData.seatIndex;
    var gameTurn = turnSeat.seatIndex;
    
    var isZhuanShouGang = false;
    if(gangtype == "wangang"){
        var idx = seatData.pengs.indexOf(pai);
        if(idx >= 0){
            seatData.pengs.splice(idx,1);
        }
        
        if(seatData.holds[seatData.holds.length - 1] != pai){
            isZhuanShouGang = true;
        }
    }
    for(var i = 0; i < numOfCnt; ++i){
        var index = seatData.holds.indexOf(pai);
        if(index == -1){
            console.log(seatData.holds);
            console.log("can't find mj.");
            return;
        }
        seatData.holds.splice(index,1);
        seatData.countMap[pai] --;
    }

    recordGameAction(game,seatData.seatIndex,ACTION_GANG,pai);

    if(gangtype == "angang"){
        seatData.angangs.push(pai);
        var ac = recordUserAction(game,seatData,"angang");
        ac.score = game.conf.baseScore*2;
    }
    else if(gangtype == "diangang"){
        seatData.diangangs.push(pai);
        var ac = recordUserAction(game,seatData,"diangang",gameTurn);
        ac.score = game.conf.baseScore*2;
        var fs = turnSeat;
        recordUserAction(game,fs,"fanggang",seatIndex);
    }
    else if(gangtype == "wangang"){
        seatData.wangangs.push(pai);
        if(isZhuanShouGang == false){
            var ac = recordUserAction(game,seatData,"wangang");
            ac.score = game.conf.baseScore;            
        }
        else{
            recordUserAction(game,seatData,"zhuanshougang");
        }

    }

    checkCanTingPai(game,seatData);
    userMgr.broacastInRoom('gang_notify_push',{userid:seatData.userId,pai:pai,gangtype:gangtype},seatData.userId,true);

    moveToNextUser(game,seatIndex);
    doUserMoPai(game);   
    
    seatData.lastFangGangSeat = gameTurn;
}

exports.gang = function(userId,pai){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var seatIndex = seatData.seatIndex;
    var game = seatData.game;

    if(seatData.canGang == false) {
        console.log("seatData.gang == false");
        return;
    }
    
    var numOfCnt = seatData.countMap[pai];

    if(numOfCnt != 1 && seatData.hued){
        console.log('you have already hued. no kidding plz.');
        return;
    }

    if(seatData.gangPai.indexOf(pai) == -1){
        console.log("the given pai can't be ganged.");
        return;   
    }
    
    var i = game.turn;
    while(true){
        var i = (i + 1)%4;
        if(i == game.turn){
            break;
        }
        else{
            var ddd = game.gameSeats[i];
            if(ddd.canHu && i != seatData.seatIndex){
                return;    
            }
        }
    }

    var gangtype = ""
    if(numOfCnt == 1){
        gangtype = "wangang"
    }
    else if(numOfCnt == 3){
        gangtype = "diangang"
    }
    else if(numOfCnt == 4){
        gangtype = "angang";
    }
    else{
        console.log("invalid pai count.");
        return;
    }
    
    game.chuPai = -1;
    clearAllOptions(game);
    seatData.canChuPai = false;
    
    userMgr.broacastInRoom('hangang_notify_push',seatIndex,seatData.userId,true);
    
    var turnSeat = game.gameSeats[game.turn];
    if(numOfCnt == 1){
        var canQiangGang = checkCanQiangGang(game,turnSeat,seatData,pai);
        if(canQiangGang){
            return;
        }
    }
    
    doGang(game,turnSeat,seatData,gangtype,numOfCnt,pai);
};

exports.hu = function(userId){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var seatIndex = seatData.seatIndex;
    var game = seatData.game;

    if(seatData.canHu == false){
        console.log("invalid request.");
        return;
    }

    seatData.hued = true;
    var hupai = game.chuPai;
    var isZimo = false;

    var turnSeat = game.gameSeats[game.turn];
    
    var huData = {
        ishupai:true,
        pai:-1,
        action:null,
        isGangHu:false,
        isQiangGangHu:false,
        iszimo:false,
        target:-1,
        fan:0,
        pattern:null,
        isHaiDiHu:false,
        isTianHu:false,
        isDiHu:false,
    };
    
    huData.numofgen = getNumOfGen(seatData);
    
    seatData.huInfo.push(huData);
    
    huData.isGangHu = turnSeat.lastFangGangSeat >= 0;
    var notify = -1;
    
    if(game.qiangGangContext != null){
        hupai = game.qiangGangContext.pai;
        var gangSeat = game.qiangGangContext.seatData;
        notify = hupai;
        huData.iszimo = false;
        huData.action = "qiangganghu";
        huData.isQiangGangHu = true;
        huData.target = gangSeat.seatIndex;
        huData.pai = hupai;
        
        recordGameAction(game,seatIndex,ACTION_HU,hupai);
        game.qiangGangContext.isValid = false;
        
        var idx = gangSeat.holds.indexOf(hupai);
        if(idx != -1){
            gangSeat.holds.splice(idx,1);
            gangSeat.countMap[hupai]--;
            userMgr.sendMsg(gangSeat.userId,'game_holds_push',gangSeat.holds);
        }
        
        gangSeat.huInfo.push({
            action:"beiqianggang",
            target:seatData.seatIndex,
            index:seatData.huInfo.length-1,
        });
    }
    else if(game.chuPai == -1){
        hupai = seatData.holds.pop();
        seatData.countMap[hupai] --;
        notify = hupai;
        huData.pai = hupai;
        if(huData.isGangHu){
            if(turnSeat.lastFangGangSeat == seatIndex){
                huData.action = "ganghua";
                huData.iszimo = true;
            }
            else{
                var diangganghua_zimo = game.conf.dianganghua == 1;
                huData.action = "dianganghua";
                huData.iszimo = diangganghua_zimo;
                huData.target = turnSeat.lastFangGangSeat;
            }
        }
        else{
            huData.action = "zimo";
            huData.iszimo = true;
        }

        isZimo = true;
        recordGameAction(game,seatIndex,ACTION_ZIMO,hupai);
    }
    else{
        notify = game.chuPai;
        huData.pai = hupai;

        var at = "hu";
        if(turnSeat.lastFangGangSeat >= 0){
            at = "gangpaohu";
        }
        
        huData.action = at;
        huData.iszimo = false;
        huData.target = game.turn;

        if(turnSeat.lastFangGangSeat >= 0){
            for(var i = turnSeat.actions.length-1; i >= 0; --i){
                var t = turnSeat.actions[i];
                if(t.type == "diangang" || t.type == "wangang" || t.type == "angang"){
                    t.state = "nop";
                    t.payTimes = 0;

                    var nac = {
                        type:"maozhuanyu",
                        owner:turnSeat,
                        ref:t
                    }
                    seatData.actions.push(nac);
                    break;
                }
            }
        }

        var fs = game.gameSeats[game.turn];
        if(at == "gangpaohu"){
            at = "gangpao";
        }
        else{
            at = "fangpao";
        }
        fs.huInfo.push({
            action:at,
            target:seatData.seatIndex,
            index:seatData.huInfo.length-1,
        });

        recordGameAction(game,seatIndex,ACTION_HU,hupai);

        game.fangpaoshumu++;

        if(game.fangpaoshumu > 1){
            game.yipaoduoxiang = seatIndex;
        }
    }

    if(game.firstHupai < 0){
        game.firstHupai = seatIndex;
    }

    var ti = seatData.tingMap[hupai];
    huData.fan = ti.fan;
    huData.pattern = ti.pattern;
    huData.iszimo = isZimo;
    huData.isHaiDiHu = game.currentIndex == game.mahjongs.length;
    
    if(game.conf.tiandihu){
        if(game.chupaiCnt == 0 && game.button == seatData.seatIndex && game.chuPai == -1){
            huData.isTianHu = true;
        }
        else if(game.chupaiCnt == 1 && game.turn == game.button && game.button != seatData.seatIndex && game.chuPai != -1){
            huData.isDiHu = true;   
        }   
    }

    clearAllOptions(game,seatData);

    userMgr.broacastInRoom('hu_push',{seatindex:seatIndex,iszimo:isZimo,hupai:notify},seatData.userId,true);
    
    if(game.lastHuPaiSeat == -1){
        game.lastHuPaiSeat = seatIndex;
    }
    else{
        var lp = (game.lastFangGangSeat - game.turn + 4) % 4;
        var cur = (seatData.seatIndex - game.turn + 4) % 4;
        if(cur > lp){
            game.lastHuPaiSeat = seatData.seatIndex;
        }
    }
    
    for(var i = 0; i < game.gameSeats.length; ++i){
        var ddd = game.gameSeats[i];
        ddd.canPeng = false;
        ddd.canGang = false;
        ddd.canChuPai = false;
        sendOperations(game,ddd,hupai);
    }

    for(var i = 0; i < game.gameSeats.length; ++i){
        var ddd = game.gameSeats[i];
        if(ddd.canHu){
            return;
        }
    }
    
    clearAllOptions(game);
    game.turn = game.lastHuPaiSeat;
    moveToNextUser(game);
    doUserMoPai(game);
};

exports.guo = function(userId){
    var seatData = gameSeatsOfUsers[userId];
    if(seatData == null){
        console.log("can't find user game data.");
        return;
    }

    var seatIndex = seatData.seatIndex;
    var game = seatData.game;

    if((seatData.canGang || seatData.canPeng || seatData.canHu) == false){
        console.log("no need guo.");
        return;
    }

    var doNothing = game.chuPai == -1 && game.turn == seatIndex;

    userMgr.sendMsg(seatData.userId,"guo_result");
    clearAllOptions(game,seatData);
    
    if(game.chuPai >= 0 && seatData.canHu){
        seatData.guoHuFan = seatData.tingMap[game.chuPai].fan;
    }

    if(doNothing){
        return;
    }
    
    for(var i = 0; i < game.gameSeats.length; ++i){
        var ddd = game.gameSeats[i];
        if(hasOperations(ddd)){
            return;
        }
    }

    if(game.chuPai >= 0){
        var uid = game.gameSeats[game.turn].userId;
        userMgr.broacastInRoom('guo_notify_push',{userId:uid,pai:game.chuPai},seatData.userId,true);
        seatData.folds.push(game.chuPai);
        game.chuPai = -1;
    }
    
    
    var qiangGangContext = game.qiangGangContext;
    clearAllOptions(game);
    
    if(qiangGangContext != null && qiangGangContext.isValid){
        doGang(game,qiangGangContext.turnSeat,qiangGangContext.seatData,"wangang",1,qiangGangContext.pai);        
    }
    else{
        moveToNextUser(game);
        doUserMoPai(game);   
    }
};

exports.hasBegan = function(roomId){
    var game = games[roomId];
    if(game != null){
        return true;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo != null){
        return roomInfo.numOfGames > 0;
    }
    return false;
};


var dissolvingList = [];

exports.doDissolve = function(roomId){
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return null;
    }

    var game = games[roomId];
    doGameOver(game,roomInfo.seats[0].userId,true);
};

exports.dissolveRequest = function(roomId,userId){
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return null;
    }

    if(roomInfo.dr != null){
        return null;
    }

    var seatIndex = roomMgr.getUserSeat(userId);
    if(seatIndex == null){
        return null;
    }

    roomInfo.dr = {
        endTime:Date.now() + 30000,
        states:[false,false,false,false]
    };
    roomInfo.dr.states[seatIndex] = true;

    dissolvingList.push(roomId);

    return roomInfo;
};

exports.dissolveAgree = function(roomId,userId,agree){
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return null;
    }

    if(roomInfo.dr == null){
        return null;
    }

    var seatIndex = roomMgr.getUserSeat(userId);
    if(seatIndex == null){
        return null;
    }

    if(agree){
        roomInfo.dr.states[seatIndex] = true;
    }
    else{
        roomInfo.dr = null;
        var idx = dissolvingList.indexOf(roomId);
        if(idx != -1){
            dissolvingList.splice(idx,1);           
        }
    }
    return roomInfo;
};



function update() {
    for(var i = dissolvingList.length - 1; i >= 0; --i){
        var roomId = dissolvingList[i];
        
        var roomInfo = roomMgr.getRoom(roomId);
        if(roomInfo != null && roomInfo.dr != null){
            if(Date.now() > roomInfo.dr.endTime){
                console.log("delete room and games");
                exports.doDissolve(roomId);
                dissolvingList.splice(i,1); 
            }
        }
        else{
            dissolvingList.splice(i,1);
        }
    }
}

setInterval(update,1000);
