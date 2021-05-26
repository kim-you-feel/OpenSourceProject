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
/*
app.get('/keyboard', (req, res) => {
  const data = {'type': 'text'}
  res.json(data);
});

app.post('/message', (req, res) => {
  const question = req.body.userRequest.utterance.trim();
  const goMain = '처음으로';
  if (question == "테스트") {
    const data = {
      'version': '2.0',
      'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': '테스트'
	      }
	    }],
	    'quickReplies': [{
	      'label': goMain,
	      'action': 'message',
	      'messageText': goMain
	    }]
      }
    }
    res.json(data); 
  }else{
    const data ={};
    res.json(data);

  } 
});
*/

app.post('/base', (req,res) =>{
  const userId = req.body.userRequest.user.id;
  var add = 0;
  userKeyword[userId] = req.body.action.params.setKeyword;
  userTime[userId] = req.body.action.params.setTime;
  
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

  const setting={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: `${userKeyword[userId]} 소식을 ${userTime[userId]}에 전해드리겠습니다.`,
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

});

app.post('/keywordChange', (req,res)=>{
  const userId = req.body.userRequest.user.id;
  const oldKeyword = userKeyword[userId];
  userKeyword[userId] = req.body.action.params.setKeyword;

  const data={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: `키워드를 ${oldKeyword}에서 ${userKeyword[userId]}로 변경하셨습니다.`,
          }
        }
      ]
    }
  };
  res.json(data);
})

app.post('/timeChange', (req,res)=>{
  const userId = req.body.userRequest.user.id;
  const oldTime = userKeyword[userId];
  userTime[userId] = req.body.action.params.setTime;

  const data={
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: `키워드를 ${oldTime}에서 ${userTime[userId]}로 변경하셨습니다.`,
          }
        }
      ]
    }
  };
  
  res.json(data);
})

app.post('/alim', (req,res)=>{
  const userId = req.body.userRequest.user.id;

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
      res.json(ex);
    }
  })
});


app.listen(3000, function () {
  console.log('node on 3000!!');
});

