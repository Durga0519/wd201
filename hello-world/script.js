function generatedgreetings(name){
    function spanish(){
        console.log(`Hola ${name}!`);
    }
    function english(){
        console.log(`Hello ${name}!`);
    }
    return {spanish,english};
};

const name ='prasad';
const greetings=generatedgreetings(name);

greetings.spanish()
greetings.english();