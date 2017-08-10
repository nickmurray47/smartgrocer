//kimm5294@gmail.com
//p:

export default (request, response) => {
    const pubnub = require('pubnub');
    const xhr = require('xhr');
    const db = require('kvstore');

    db.set("1", {name: "Walgreens", id: "23456", items: [{rice: 2.99}, {beans: 3.99}]})
    .then(()=>{db.set( "2", {name: "Kam Man Food", id: "23456", items: [{rice: 1.99}, {beans: 3.99}]})});

    //.then(()=>{
    //db.set("rice", "https://www.livescience.com/50461-brown-rice-health-benefits-nutrition-facts.html")});

    let headersObject = request.headers;
    let paramsObject = request.params;
    let methodString = request.method;
    let bodyString = request.body;

    let VERIFY_TOKEN = 'NICK_TOKEN';
    let PAGE_ACCESS_TOKEN = 'EAAaYtYBquDwBAIKwziGxZA8qCTjNwQblYszYxd073LXHBbww0svmS6lqLGQN51nqiE3BNxuuAur4fqsdf68CUmzWAaThLbeepiK0eSBY7lmQO4ZCkD41pS3HuHww8U6Ta2MGjANn0bHDe72n9epZAvlOmpwSwCAKh6zznNvOQZDZD';

    // Facebook validation
    if(methodString == 'GET'){
        if (paramsObject['hub.mode'] === 'subscribe' && paramsObject['hub.verify_token'] === VERIFY_TOKEN) {
            console.log("Validating webhook");
            response.status = 200;
            response.body = paramsObject['hub.challenge'];
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            response.status = 403;
        }

      return Promise.resolve(response);
    } else {
        let data = JSON.parse(request.body);

        // Make sure this is a page subscription
        if (data.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach(function(entry) {
                let pageID = entry.id;
                let timeOfEvent = entry.time;
                // Iterate over each messaging event
                entry.messaging.forEach(function(msg) {
                    if (msg.message) {
                        receivedMessage(msg);
                    } else if (msg.postback) {
                        // receivedPostback(msg);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });

        }
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.

        response.status = 200;

        return Promise.resolve(response);
    }


    function receivedMessage(event) {
            let senderID = event.sender.id;
            let recipientID = event.recipient.id;
            let timeOfMessage = event.timestamp;
            let message = event.message;

            console.log(`Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} with message: ${JSON.stringify(message)}`);

            let messageId = message.mid;
            let messageText = message.text;
            let messageAttachments = message.attachments;

            if (messageText) {
                // If we receive a text message, check to see if it matches a keyword
                // and send back the example. Otherwise, just echo the text we received.

                let str = messageText;
                console.log(str);

                if(str='hey', 'hello', 'hey there', 'howdy', 'hola', 'hi'){
                    sendGreetings(senderID, str);
                }

                switch (messageText) {
                    case 'generic':
                        sendGenericMessage(senderID);
                        break;
                    case 'Name the closest grocery stores':
                        sendGroceryStore(senderID);
                        break;
                    case 'items':
                        sendGroceryList(senderID);
                        break;
                    case 'List of items':
                        sendGroceryList(senderID);
                        break;
                    case 'Find the cheapest bag of rice':
                        // /(Find the cheapest) \w*/
                        findCheapestIngredient(senderID);
                        break;
                    case 'List recipes with rice':
                        sendRecipes(senderID);
                        break;
                    default:
                        sendTextMessage(senderID, messageText);
                }
            } else if (messageAttachments) {
                sendTextMessage(senderID, "Message with attachment received");
            }
     }

    function sendTextMessage(recipientId, messageText) {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };
        callSendAPI(messageData);
        console.log("Successfully sent generic message");
    }


    function callSendAPI(messageData) {

        const http_options = {
        "method": "POST",
        "body": JSON.stringify(messageData),
        "headers": {
                'Content-Type': 'application/json'
            }
        };

        const url = "https://graph.facebook.com/v2.6/me/messages?access_token=" + PAGE_ACCESS_TOKEN;
        console.log("waddup from outside api fetch call")
        return xhr.fetch(url, http_options).then((x) => {
            console.log("sup from fetch call")
            const body = JSON.parse(x.body);
            return request.ok();
        });
    }

       function sendGreetings(recipientId, messageText) {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText+ ", what's your name?"
            }
        };
        callSendAPI(messageData);
        console.log("Successfully sent generic message");
    }


    function sendGenericMessage(recipientId) {
      let messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: "rift",
                subtitle: "Next-generation virtual reality",
                item_url: "https://www.oculus.com/en-us/rift/",
                image_url: "http://messengerdemo.parseapp.com/img/rift.png",
                // buttons: [{
                //   type: "web_url",
                //   url: "https://www.oculus.com/en-us/rift/",
                //   title: "Open Web URL"
                // }, {
                //   type: "postback",
                //   title: "Call Postback",
                //   payload: "Payload for first bubble",
                }],
            //   }, {
            //     title: "touch",
            //     subtitle: "Your Hands, Now in VR",
            //     item_url: "https://www.oculus.com/en-us/touch/",
            //     image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            //     buttons: [{
            //       type: "web_url",
            //       url: "https://www.oculus.com/en-us/touch/",
            //       title: "Open Web URL"
            //     }, {
            //       type: "postback",
            //       title: "Call Postback",
            //       payload: "Payload for second bubble",
            //     }]
            // }]
            }
          }
        }
      };

      callSendAPI(messageData);
}

function sendGroceryStore(recipientId) {
    db.get("1", "2").then((value) => {
        let messageData = {
        recipient: {
          id: recipientId
        },
        message: {attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: "Here are the stores: " + value.name,
                subtitle: value.name,
                item_url: "https://www.walgreens.com/locator/walgreens-755+broadway-brooklyn-ny-11206/id=1918",
                image_url: "https://lh3.googleusercontent.com/0nUIECwuvnb-sKqYF1DgY28JkLGFom8RZxdUZ2GFdfcvNrQ0ncz6V4elTBKUGKUuY8Q=w300",
          //text: "Here are the stores: " + value.name

                    }],
                 }
             }
        }
      };
      console.log("hello from sendgrocerystore")
      callSendAPI(messageData);
    }).catch(()=>{console.log("broken")})
}

function sendRecipes(recipientId) {
        let messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          text: "Here are recipes with 'rice': http://allrecipes.com/recipes/224/side-dish/rice/"
            }
      };
      callSendAPI(messageData);
}

function sendGroceryList(recipientId) {
   db.get("1").then((value) => {
   // take user input and split it into an array, grab last value of the array
   // then with last value, use a if key exists grab value, store values and compare

        let messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          text: "Here are the items: "+ JSON.stringify(value.items)
            }

      };
      callSendAPI(messageData);
      console.log("Success!");
    }).catch(()=>{console.log("broken")});
}

function findCheapestIngredient(recipientId) {
   db.get("2").then((value) => {
   // take user input and split it into an array, grab last value of the array
   // then with last value, use a if key exists grab value, store values and compare
   let rice = value.items[0];

        let messageData = {
        recipient: {
          id: recipientId
        },
        message: {attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: "Cheapest location for rice: " + value.name,
                subtitle: "Price for " + JSON.stringify(rice),
                item_url: "http://www.kamman.com/",
                image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kam_Man_Food.jpg/1200px-Kam_Man_Food.jpg",
          //text: "Here are the stores: " + value.name

                    }],
                 }
             }
        }
      };
      callSendAPI(messageData);
    }).catch(()=>{console.log("broken")});
}
// function sendNutritionalInfo(recipientId) {
//   let messageData = {
//         recipient: {
//           id: recipientId
//         },
//         message: {
//           attachment: {
//             type: "template",
//             payload: {
//               template_type: "generic",
//               elements: [{
//                 title: "rift",
//                 subtitle: "Next-generation virtual reality",
//                 item_url: "https://www.oculus.com/en-us/rift/",
//                 image_url: "http://messengerdemo.parseapp.com/img/rift.png",
//                 buttons: [{
//                   type: "web_url",
//                   url: "https://www.oculus.com/en-us/rift/",
//                   title: "Open Web URL"
//                 }, {
//                   type: "postback",
//                   title: "Call Postback",
//                   payload: "Payload for first bubble",
//                 }],
//               }, ]
//             }
//           }
//         }
//       };

//       callSendAPI(messageData);
// }


    console.log('request',request); // Log the request envelope passed
    // Query parameters passed are parsed into the request.params object for you
    // console.log(paramsObject.a) // This would print "5" for query string "a=5

    // Set the status code - by default it would return 200
    response.status = 200;
    // Set the headers the way you like
    response.headers['X-Custom-Header'] = 'CustomHeaderValue';

    return request.json().then((body) => {
        return response.send(body);
    }).catch((err) => {
        // console.log(err)
        return response.send("Malformed JSON body.");
        });
};
