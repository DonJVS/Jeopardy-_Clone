
let categories = [];

const API_BASE_URL = 'https://rithm-jeopardy.herokuapp.com/api';
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

async function getCategoryIds() {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: { count: 100 }
    });
    const data = response.data;
    //using the lodash library for _.sampleSize() to randomize the categories that will be added to the array
    const randomIDs = _.sampleSize(data, NUM_CATEGORIES);
    //defining variable categoryIDs to map the extracted ids to an array
    const categoryIDs = randomIDs.map(item => item.id);
    console.log(categoryIDs);
    return categoryIDs;
};

async function getCategory(catId) {
    let response = await axios.get(`${API_BASE_URL}/category`, {
      params: { id: catId }
    });
    let catObj = response.data;
    console.log(catObj);
    //defining variable to get a random clue from the object and map it to the array
    let randomClue = _.sampleSize(catObj.clues, NUM_QUESTIONS_PER_CAT).map(clue => ({
      question: clue.question,
      answer: clue.answer,
      showing: null
    }));
    //returns the title of the category and the randomly selected clues from the category
    return {title: catObj.title, clues: randomClue}; 
}

async function fillTable() {
  hideLoadingView();
  //defining variables to add html elements for the table
  const $table = $('<table id="jeopardy"></table>');
  const $thead = $('<thead></thead>');
  const $headerRow = $('<tr></tr>');
  const $tbody = $('<tbody></tbody>');
  //takes each category in the array and appends the title to the header row
  categories.forEach(cat => {
    const $th = $('<th></th>').text(cat.title);
    $headerRow.append($th);
  });
  //appends the row to the header
  $thead.append($headerRow);
  //appends the header to the table
  $table.append($thead);
  //loops through 5 times to create 5 rows
  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    const $row = $('<tr></tr>');
    //loops through 6 times to create 6 columns each with a td element
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      //defining variable to set the td text to a ?
      const $cell = $('<td></td>').text('?')
      //sets the data attributes for both the category and clue
        .data('catIndex', j)
        .data('clueIndex', i)
        //attaches the click event handler whenever a cell is click which calls the handleClick function
        .on('click', handleClick);
        //appends the cells to the row
        $row.append($cell);
    }
    //appends the row to the body of the table
    $tbody.append($row);
  }
  //appends the table body to the table
  $table.append($tbody);
  // appends the table to the body of the html
  $('body').append($table);
}

function handleClick(evt) {
  const $cell = $(evt.target);
  const catIndex = $cell.data('catIndex');
  const clueIndex = $cell.data('clueIndex');
  let clue = categories[catIndex].clues[clueIndex];
  //when the cell is clicked, and there is nothing showing, update the text to show the question and add class of question
  if (clue.showing === null) {
    $cell.text(clue.question).addClass('question');
    clue.showing = 'question';
    //if the clue shows a question and is clicked, update the text to show the answer and replace the question class with answer
  } else if (clue.showing === 'question') {
    $cell.text(clue.answer).removeClass('question').addClass('answer');
    clue.showing = 'answer';
  }
}

// Wipe the current Jeopardy boardand update the button used to fetch data.

function showLoadingView() {
  $('#jeopardy').remove();
  $('body').append('<p id="loading">Loading...</p>');
}
/** update the button used to fetch data. */

function hideLoadingView() {
  $('#loading').remove();
  $('#start').text('Restart');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let loadGame = $('#start').text() === "loading...";
  if (!loadGame) {
    showLoadingView();
    let catIds = await getCategoryIds();
    categories = [];
    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }
    fillTable();
  }
}

/** On click of start / restart button, set up game. */
$(document).ready(function() {
  $('body').append('<button id="start">Start Game</button>');
  $('#start').on('click', setupAndStart);
});
