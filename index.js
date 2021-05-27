const express = require('express');
const app = express();
var cron = require('node-cron');
var client_id = 'EM8IgHPw_W2OsvVwmmxA';
var client_secret = 'FxmVqQSuhG';
var userDB = {};
var userKeyword = {};
var userTime ={};

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/Keyword', (req,res) =>{
  const userId = req.body.userRequest.user.id;
  var xid;
  var add = 0;
  
  for(var i = 0; i < userDB.length; i++){
    if(userDB[i] == userId){
      add = 0;
    }else{
      add = 1;
    }
  }

  if(add == 1){
    userDB[userDB.length+1] = userId;
  }

  if(userKeyword[userId] != null){
    xid = "60afbfd997e00171aadc87fe";
  }else{
    xid = "60afc0d997e00171aadc8801";
  }
  console.log(xid);
  const setting={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: "키워드를 설정하시겠습니까?",
            buttons: [
              {
                action: "block",
                label: "예",
                blockId:xid
              },
              {
                action: "block",
                label: "아니오",
                blockId:"60afc1369657424ac11db192"
              }
            ]
          }
        }
      ]
    }
  };

  res.json(setting);

});

app.post('/KeywordQ', (req,res) =>{

  const setting={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: "키워드가 이미 존재합니다. 변경하시겠습니까?",
            buttons: [
              {
                action: "block",
                label: "예",
                blockId:"60afc0d997e00171aadc8801"
              },
              {
                action: "block",
                label: "아니오",
                blockId:"60afc1369657424ac11db192"
              }
            ]
          }
        }
      ]
    }
  };

  res.json(setting);
});

app.post('/setKeyword', (req,res)=>{
  const userId = req.body.userRequest.user.id;
  userKeyword[userId] = req.body.action.params.setKeyword;

  const setting={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: `${userKeyword[userId]} 소식을 전해드리겠습니다.`,
            buttons: [
              {
                action: "block",
                label: "OK",
                blockId:"60ab7dd1e0891e661e4a9f02"
              }
            ]
          }
        }
      ]
    }
  };

  res.json(setting);

})

app.post('/alim', (req,res)=>{
  const userId = req.body.userRequest.user.id;
  
  if(userKeyword[userId].length != 0){
    const ar={
      'version': '2.0',
      'template': {
      'outputs': [{
        "simpleText":{
          "text": `${userKeyword[userId]}입니다.`
      }
        }]
      } 
    }

    res.json(ar);
  } else{
    const ar={
      'version': '2.0',
      'template': {
      'outputs': [{
        "simpleText":{
          "text": "키워드가 없습니다."
      }
        }]
      } 
    }
    res.json(ar);
  }

})

app.post('/news', (req,res)=>{
  const request = require('request');
  const userId = req.body.userRequest.user.id;
  let ex;
  let data;
  let qr = userKeyword[userId];
  let arrayLink = [];
  let arrayTitle = [];
  let removeStrings = ["&Hat;", "&apos;", "&gt;", "&lt;", "&semi;", "&amp;", "&quot;", "&num;","<b>", "</b>"];
  
  const option = {
    query  :qr,
    start  :1,
    display:3,
    sort   :'sim'
  }
  request.get({
    uri:'https://openapi.naver.com/v1/search/news.json', 
    qs :option,
    headers:{
      'X-Naver-Client-Id':client_id,
      'X-Naver-Client-Secret':client_secret
    }
  },function(err, result, body) {
    data = JSON.parse(body);
    data.items.forEach(element => {
      arrayLink.push(element.link);
    });
    data.items.forEach(element =>{
      let title = element.title.replace(removeStrings[0],"");
      for(let i = 0; i < removeStrings.length; i++){
        if(title.indexOf(removeStrings[i]) != -1)
        {
          title = title.replace(removeStrings[i], "");
          i--;
        }
      }
      arrayTitle.push(title);
    })
    if(arrayLink.length != 0){
      ex={
        'version': '2.0',
        'template': {
          'outputs': [{
            "listCard":{
              "header":{
                "title":`${userKeyword[userId]}에 대한 기사입니다.`
              },
              "items":[
                {
                  "title": arrayTitle[0],
                  "link":{
                    "web": arrayLink[0]
                  }
                },
                {
                  "title": arrayTitle[1],
                  "link":{
                    "web": arrayLink[1]
                  }
                },
                {
                  "title": arrayTitle[2],
                  "link":{
                    "web": arrayLink[2]
                  }
                }
              ]
            }
          }]
        } 
      }
      console.log(data);
      res.json(ex);
    }else{
      ex={
        'version': '2.0',
        'template': {
        'outputs': [{
            'simpleText': {
              'text':"기사가 없습니다."
          }
          }]
        } 
      }
      userKeyword[userId] = null;
      userTime[userId] = null;
      res.json(ex);
    }
  })
});


app.listen(3000, function () {
  console.log('node on 3000!!');
});

