(async () => {
  const response = await fetch("https://raw.githubusercontent.com/fupicat/text/main/wordle.json");
  if (!response.ok) {
    throw response.text();
  }
  const allWords = await response.json();

  playGame();

  async function playGame() {

    const lives = 6;
    const states = {
      correct: 1,
      present: 0,
      absent: -1,
    }

    let info = {
      correct: [],
      present: [],
      wrong: [],
      tried: [],
    }

    // Function that plays a word
    async function play(word, attempt) {
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      let feedback = [];

      for (const letter of word) {
        document.querySelector('game-app').$keyboard.$keyboard.querySelector(`button[data-key='${letter}']`).click()
      }
      document.querySelector('game-app').$keyboard.$keyboard.querySelector(`button[data-key='↵']`).click()
      
      let evaluations = JSON.parse(localStorage["nyt-wordle-state"]).evaluations[attempt]

      await timeout(2000);

      feedback.push(states[evaluations[0]]);
      feedback.push(states[evaluations[1]]);
      feedback.push(states[evaluations[2]]);
      feedback.push(states[evaluations[3]]);
      feedback.push(states[evaluations[4]]);

      console.log(feedback.toString());
    
      return feedback;
    }

    // Game loop
    game: for (let attempt = 0; attempt < lives; attempt++) {
      //console.log("Attempt " + attempt + ":");

      // Play first word that applies to info
      nextWord: for (const word of allWords) {

        // Check letters that are correct
        for (const i of info.correct) {
          if (word[i.pos] !== i.letter) continue nextWord;
        }

        // Check letters that are present (we only know where it's not)
        for (const i of info.present) {
          if (word[i.pos] === i.letter) continue nextWord;
          if (word.indexOf(i.letter) === -1) continue nextWord;
        }

        // Check letters that are wrong
        for (const i of info.wrong) {
          if (word.indexOf(i) !== -1) continue nextWord;
        }

        // Check if we already tried that word
        if (info.tried.indexOf(word) !== -1) continue nextWord;

        // If all checks fail, we play the word.
        let feedback = await play(word, attempt);

        // Interpret the feedback and add info

        // Check if all the letters are correct by summing total score
        if (feedback.reduce((a, b) => a + b) == 5) {
          //console.log("Congrats!!! The word was: " + answer);
          return true;
        }

        // Check all clues
        for (let index = 0; index < feedback.length; index++) {
          const fb = feedback[index];

          if (fb == states.correct) info.correct.push({pos: index, letter: word[index]});
          else if (fb == states.present) info.present.push({pos: index, letter: word[index]});
          else if (fb == states.absent) info.wrong.push(word[index]);
          else throw "Wtf?";
        }

        // End of attempt
        break;
      }
    }

    return false;
  }
})();
