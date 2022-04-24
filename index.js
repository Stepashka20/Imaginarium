const { VK,API,Keyboard  }= require('vk-io');
const { SessionManager } = require('@vk-io/session');
const shuffle = require('lodash/shuffle');
const range = require('lodash/range');

const keywords = require('./keywords.json');

const vk = new VK({
	token: process.env.TOKEN
});
const sessionManager = new SessionManager();

vk.updates.on('message_new', sessionManager.middleware);

vk.updates.on('message_new', async (context, next) => {
    if (!context.messagePayload) return next();
	const cmd = context.messagePayload.command;
    if (cmd == "start"){
        context.text = "старт"
        return next()
    }
    const { session } = context
    switch (cmd){
        case "exit":
            delete session.question
            delete session.score
            delete session.cards
            context.send({
                message:"Выберите пункт:", 
                keyboard: Keyboard.builder()
                .textButton({
                    label: 'Одиночная игра',
                    payload: {
                        command: 'singleplayer'
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            })
            break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":   
        if (session.question){
            if (!session.score) session.score=0
            if (+cmd-1  == session.question.num){
                session.score+=3
                context.send(`Вы угадали 🤩 Ваш счёт: ${session.score}`)
            }else{
                context.send(`Вы не угадали ☹ Ваш счёт: ${session.score}`)
            }
        } 
        case "singleplayer":
            var words = []
            if (!session.cards){
                session.cards = shuffle(range(0,98+1))
            }
            if (session.cards.length < 5){
                session.cards = shuffle(range(0,98+1))
            }
            var cards_num = session.cards.slice(0,5)
            for (let i=0;i<5;i++) session.cards.shift()
            cards_num.forEach(num => words.push(keywords[num]))
            const question = getQuestion(words)
            session.question = question

            let attachments = ""
            cards_num.forEach(id=>attachments+=`photo-212872521_${457239017+id},`)
            context.send({
                message:`Слово: ${question.word}.\nКакая из карт соответствует этому слову? Нажмите соответствующую цифру.`, 
                attachment: attachments,
                keyboard: Keyboard.builder()
                            .textButton({
                                label: '1',
                                payload: {command: '1'},
                                color: Keyboard.POSITIVE_COLOR
                            })
                            .textButton({
                                label: '2',
                                payload: {command: '2'},
                                color: Keyboard.POSITIVE_COLOR
                            })
                            .textButton({
                                label: '3',
                                payload: {command: '3'},
                                color: Keyboard.POSITIVE_COLOR
                            })
                            .textButton({
                                label: '4',
                                payload: {command: '4'},
                                color: Keyboard.POSITIVE_COLOR
                            })
                            .textButton({
                                label: '5',
                                payload: {command: '5'},
                                color: Keyboard.POSITIVE_COLOR
                            })
                            .row()
                            .textButton({
                                label: 'Закончить игру',
                                payload: {
                                    command: 'exit'
                                }
                            })
            })
            break;
           
    }
});

vk.updates.on('message_new', async (context, next) => {
    const text = context.text.toLowerCase()

    if (text== "старт"){
        context.send({
            message:"Выберите пункт из меню:", 
            keyboard: Keyboard.builder()
            .textButton({
                label: 'Одиночная игра',
                payload: {
                    command: 'singleplayer'
                },
                color: Keyboard.POSITIVE_COLOR
            })
        })
    }
});

function getQuestion(mas){
    //Выбирает уникальное слово в двумерном массиве и возвращает его с номером своей карточки
    var flatArr = shuffle(mas.flat(1))
    var question = {}

    flatArr.forEach(item => {
        var s = 0
        flatArr.forEach(el => { if (el == item) s++ })
        if (s == 1) {
            question.word = item;
            mas.forEach((arr, i) => arr.forEach(element => { if (element == item) question.num = i }))
        }
    })

    return question
}
vk.updates.start().catch(console.error);