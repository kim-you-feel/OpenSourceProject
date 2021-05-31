const express = require('express');
const app = express();
var Twitter = require('twitter');
var cron = require('node-cron');
const client_id = 'EM8IgHPw_W2OsvVwmmxA';
const client_secret = 'FxmVqQSuhG';
const APIKEY = 'vMi6YAZEtB2FdkIjAuW4mdfpn';
const ACCESSTOKEN1 = '1352505233415446528-FZoj6bHFirqmq6xDoiLxHCrIo4FNYm';
const BEARERTOKEN = 'AAAAAAAAAAAAAAAAAAAAAGKLQAEAAAAA98gZSv417FwhovvbsJortg%2FygSM%3DE1ODm9TiUIwILJf7KuRdUJJKKiiYtham1kJevNoyY19bCfeL7P';
const ACCESSTOKEN2 = '1352505233415446528-Zv7fz7rKExEGwDnRk52chwFQsti4Wl';
const ACCESSTOKENS = 'LsSaHCh1uuS64CPIp0hp7aPKosBv5xqVvJjtDLj0bCuG9';
var userDB = {};
var userKeyword = {};
var userTime ={};
var userNumber = {};
var userNumbert = {};

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
  userNumber[userId] = 0;
  userNumbert[userId] = 0;

  const setting={
    'version': "2.0",
    'template': {
      'outputs': [
        {
          'basicCard': {
            'description': `${userKeyword[userId]} 소식을 전해드리겠습니다.`,
            'buttons': [
              {
                'action': "block",
                'label': "OK",
                'blockId':"60ab7dd1e0891e661e4a9f02"
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
    display:10,
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
    data.items.forEach(element =>{
      let pubDate = element.pubDate;
      if(Date.now() - 86400000 < Date.parse(pubDate) && Date.parse(pubDate) < Date.now()){
        arrayLink.push(element.link);
        let title = element.title.replace(removeStrings[0],"");
        for(let i = 0; i < removeStrings.length; i++){
          if(title.indexOf(removeStrings[i]) != -1)
          {
            title = title.replace(removeStrings[i], "");
            i--;
          }
        }
          arrayTitle.push(title);
      }
      
    })
    

    if(arrayLink.length > userNumber[userId] + 3){
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
                  "title": arrayTitle[userNumber[userId]],
                  "link":{
                    "web": arrayLink[userNumber[userId]++]
                  }
                },
                {
                  "title": arrayTitle[userNumber[userId]],
                  "link":{
                    "web": arrayLink[userNumber[userId]++]
                  }
                },
                {
                  "title": arrayTitle[userNumber[userId]],
                  "link":{
                    "web": arrayLink[userNumber[userId]++]
                  }
                }
              ],
              "buttons" :[
                {
                  "label" : "더 보기",
                  "action" : "block",
                  "blockId" : "60ab7dd1e0891e661e4a9f02"
                }
              ]
            }
          }]
        } 
      }
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
      res.json(ex);
    }
  })
});

app.post('/twitter', (req,res) =>{
  let twitterText = [];
  const userId = req.body.userRequest.user.id;
  var request = require('request');
    var options = {
      'method': 'GET',
      'url': 'https://api.twitter.com/2/tweets/search/recent?query='+ encodeURI(userKeyword[userId]),
      'headers': {
        'Authorization': `Bearer ${BEARERTOKEN}`
      }
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      dat = JSON.parse(response.body);
      dat.data.forEach(element =>{
        txt = element.text;
        twitterText.push(txt);
      })
      if(twitterText.length > userNumbert[userId] + 3){
        ex={
          'version': '2.0',
          'template': {
            'outputs': [{
              "listCard":{
                "header":{
                  "title":`${userKeyword[userId]}에 대한 트윗입니다.`
                },
                "items":[
                  {
                    "title": twitterText[userNumbert[userId]++]
                  },
                  {
                    "title": twitterText[userNumbert[userId]++]
                  },
                  {
                    "title": twitterText[userNumbert[userId]++]
                  }
                ],
                "buttons" :[
                  {
                    "label" : "더 보기",
                    "action" : "block",
                    "blockId" : "60b4b685e0891e661e4acba6"
                  }
                ]
              }
            }]
          } 
        }
        res.json(ex);
      } else{
        ex={
          'version': '2.0',
          'template': {
          'outputs': [{
              'simpleText': {
                'text':"트윗이 없습니다."
            }
            }]
          } 
        }
        res.json(ex);
      }
    });
})

app.listen(3000, function () {
  console.log('node on 3000!!');
});