/*

  Custom Learning Journal in Rise
  -------------------------------

  version: 2.1
  Project page: https://github.com/mikeamelang/learning-journal


  The Learning Journal allows a learner to enter text responses to
  journal prompts throughout a Rise module. At the end of the module, the learner
  can print their “learning journal” of all their responses. The responses are saved
  to the computer so that they persist on future visits to the Rise module.

  HOW TO ADD JOURNAL PROMPTS:
  Wherever a Journal Entry is needed in the Rise module, add a new block of type
  “NOTE” from the “STATEMENT” area and enter the following text:

    Journal Entry
    Section: <insert section name here>
    Prompt: <insert prompt here>
    Take Action: yes <if this is a Take Action item>

  HOW TO ADD AN INTRO TO A SECTION ON THE PRINTED JOURNAL:
  Wherever an intro to a section is needed in the Rise module, add a new block of type
  “NOTE” from the “STATEMENT” area and enter the following text:

    Section Intro
    Section: <insert section name here>
    Section Order: <insert printing order number here. This is optional)
    Intro Title: <insert title to the intro here, like Reflection Activity>
    Intro Text: <insert the text of the intro here>

  HOW TO ADD PRINT BUTTONS OR PROVIDE A CUSTOM TITLE TO THE LEARNING JOURNAL:
  Two print buttons will be shown: Print all journal items and Print take
  action items only. (The actual text of these buttons is customized with the variables below:
  PrintAllButton_Text, PrintTakeActionsOnly_Text and EmailButton_Text)
  Wherever the print buttons are desired in the Rise module, add a new block of type
  “NOTE” from the “STATEMENT” area and enter the following text:

    Journal Buttons
    Course Title: <insert course title here>
    Include Email Button: <yes/no> (This is not required. Default is no.)
    Email Address: <insert email to which journals will be emailed> (This is only required
      if the above "Include Email Button" is set to true.)

*/

// These css selectors select the Notes and select the contents of each Note
var noteSelector =  ".block-impact--note .block-impact__row"; // "[aria-label='Note']";
var noteContentsSelector = '.fr-view';

// These are the flags that must appear at the first line of the Note or the
// Note will not be successfully processed
var flagEntry = "Journal Entry";
var flagButtons = "Journal Buttons";
var flagIntro = "Section Intro";
var flagSelect = "Journal Select";
var flagSelectTwo = "Journal Select Two";
var flagRadio = "Journal Entry Radio";

// These are the labels that accompany the data. These must be entered exactly
// correct or the Note will not be successfully processed
var sectionlabel = "Section:";
var promptlabel = "Prompt:";
var takeactionlabel = "Take Action:";
var coursetitlelabel = "Course Title:";
var includeEmailButtonLabel = "Include Email Button:";
var emailAddressLabel = "Email Address:";
var introsectionlabel = "Section:";
var introSectionOrderLabel = "Section Order:";
var introtitlelabel = "Intro Title:";
var introtextlabel = "Intro Text:";
var optionlabel = "Options:";

// These are the text for the Print buttons
var PrintAllButton_Text = "Print My Journal";
var PrintTakeActionsOnly_Text = "Print My Actions";
var EmailButton_Text = "Email My Journal"; // text for the Email button, if active


// These are the data storage variables. When the course loads, these are filled
// with any existing journal entries found in localStorage. Likewise, when any entries are
// updated, these data storage variables are updated AND the localStorage is updated.
var UserData = {};
UserData.Sections = [];
var courseTitle = '';

// localStorageItem is the item in localStorage where the journal entry data is stored.
// a unique identifier is formed by concatenating
// localStorageItem_prefix and the URL path up to the html file.
var localStorageItem_prefix = 'LearningJournal_';
var localStorageItem = '';

// image in the printed journal header
var imageIntroHeader = 'http://amelangrise.s3.amazonaws.com/SharedAssets/images/Reflection_Dark.png';

// These are the settings used by the autosave of journal entries
var typingTimer;                //  timer identifier
var doneTypingInterval = 400;  //  time in ms

// Test if browser is firefox (used in printEntries)
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

/* ------------------------------------------------------------------------------------------------ */


$(document).ready(function() {
  setlocalStorageItem();
  getSectionsfromLocalStorage();
  initialProcessNotes();
  addEvents();

  $('#app').on('DOMNodeInserted', function(e) {

    if($('#app #book_pdf').length<1){
      //Add book Button
      $('#app .transition-group').append('<button href="#book_modal" class="view-book" id="book_pdf">Book</button>');
      //Add book Iframe
      $('body').append('<div class="modal-overaly"><div class="modal-book" id="book_modal"><span class="close" rel:close>&#10005;</span><iframe id="book_iframe" src="assets/custom/PDFBookView/index.html" frameborder="0" width="100%" height="600"></iframe></div></div>');
    } 

    $('#app .blocks-lesson select').trigger('change');

    // console.log($('#app select').length)
    // console.log($('#app').find('select').length)

  });
  
});

// Open book PDF
$(document).on('click', '#book_pdf', function(e){
  e.preventDefault();
  $('.modal-overaly').addClass('open');

  var iFrameTest = document.getElementById('book_iframe'); 
  iFrameTest.contentWindow.CreateBookView();

  $('.close').on('click', function(){
    $(this).closest('.modal-overaly').removeClass('open');
  })

});


// $(document).on('change', '.journalentry-select-one select', function(){
  
//   var entryId = $(this).closest('.journalentry-select-wrap').data('entryid'),
//       sectionId = $(this).closest('.journalentry-select-wrap').data('sectionid'),
//       sectionValue = UserData.Sections[sectionId].entries[entryId].response;

//       console.log(sectionId);

//   console.log(UserData.Sections[sectionId].entries[entryId].response);
  
//   var selectList = $('.journalentry-select-one[data-sectionid="'+sectionId+'"] select');

//   console.log(selectList)

//   selectList.each(function(){
//     var currentVal = $(this).val();

//     if (sectionValue != currentVal){
//       $(this).find('option[value="'+sectionValue+'"]').prop('disabled', true);
//     }
//   }) 

  

//   var seletArr = [];

//   $('.journalentry-select-one[data-sectionid="'+sectionId+'"] select').each(function(){    
//     var selectVal = $(this).val();

//     if(selectVal!=null){
//       seletArr.push(selectVal);      
//     }     
    
//   })
//   // console.log(seletArr);

//   // $('.journalentry-select-one select option').each(function(){ 

//   //   $(this).prop('disabled', false);
//   //   var thisVal = $(this).text()
  
//   //   for (let i = 0; i < seletArr.length; i++) {
//   //     const e = seletArr[i];  

//   //     if( !$(this).is(':selected') && thisVal == e ){
//   //       $(this).prop('disabled', true);
//   //     }      
      
//   //   }
    
//   // })

// })
$(document).on('change', '.journalentry-select-two select', function(){   

  var seletArr = [];

  // $(this).find('option:selected').prop('selected', true);  

  $('.journalentry-select-two select').each(function(){    
    var selectVal = $(this).val();

    if(selectVal!=null){
      seletArr.push(selectVal);      
    }     
    
  })
  console.log(seletArr);

  $('.journalentry-select-two select option').each(function(){

    $(this).prop('disabled', false);
    var thisVal = $(this).text()
  
    for (let i = 0; i < seletArr.length; i++) {
      const e = seletArr[i];  

      if( !$(this).is(':selected') && thisVal == e ){
        $(this).prop('disabled', true);
      }      
      
    }
    
  })

})




/**
  * @desc sets the value for the variable localStorageItem by concatenating
  *     localStorageItem_prefix and and the URL path up to the html file
  * @param none
  * @return string
*/
function setlocalStorageItem() {
  var loc = document.location;
  var uniqueURL = loc.origin + loc.pathname.substring(0, loc.pathname.lastIndexOf("/"));
  // localStorageItem = localStorageItem_prefix + encodeURIComponent(uniqueURL);
  localStorageItem = localStorageItem_prefix;
}



/**
  * @desc Run processNotes several times when the page first loads
  * @return none
*/
function initialProcessNotes(  ) {
  var MAX_INSTANCES = 5;
  var instances = 0;
  var myInterval = setInterval(myTimerProcessNotes, 300);
  function myTimerProcessNotes() {
    instances++;
    if (instances === MAX_INSTANCES ) {
      clearInterval(myInterval);
    }
    if (processNotes()) { clearInterval(myInterval) }
  }
}



/**
  * @desc add eventlisteners so that the func processNotes is fired when appropriate
  * @param none
  * @return none
*/
function addEvents() {

  // fire processNotes when the url changes
  function hashchanged(){
    processNotes();
  }
  window.addEventListener("hashchange", hashchanged, false);

  // fire processNotes when the CONTINUE button is clicked and new blocks are dynamically added
  function nodeadded(event) {
    if( event.relatedNode.nodeName == "SECTION" ) {
      if ( event.relatedNode.className == "blocks-lesson" ) {
        processNotes();
      }
    }

  }
  window.addEventListener("DOMNodeInserted", nodeadded, false);
 
}



/**
  * @desc Create Section object
  * @param string title - title of section
  * @param string introtitle - title of the section intro that appears in printed journal
  * @param string introtext - text of the section intro that appears in printed journal
  * @return none
*/
function Section( title, order, introtitle, introtext ) {
  if (!order) {
    order = 999
  }
    this["title"] = title;
    this["order"] = order;
    this["entries"] = [];
    introtitle = (introtitle) ? introtitle : '';
    this["introtitle"] = introtitle; // optional
    introtext = (introtext) ? introtext : '';
    this["introtext"] = introtext; // optional
}


/**
  * @desc Create Entry object
  * @param string section - which section does this entry belong in (linked to a Section object)
  * @param string prompt - text of the prompt
  * @param string response - text of the response (blank if new)
  * @param bool isTakeAction - is this a Take Action?
  * @return none
*/
function Entry( section, prompt, response, isTakeAction, option ) {
	this["section"] = section;
	this["prompt"] = prompt;
  this["response"] = response;
  this["isTakeAction"] = isTakeAction;
  this["option"] = option;
    // another data element is entryid, added after the entry is created
    // another data element is sectionid, added after the entry is created
}


/**
  * @desc these functions either copy localStorageItem to UserData.Sections or vice versa
  * @param none
  * @return none
*/
function setSectionstoLocalStorage() {
  localStorage.setItem(localStorageItem, JSON.stringify(UserData.Sections));
}
function getSectionsfromLocalStorage() {
  var retrievedString = localStorage.getItem(localStorageItem);
  if ( retrievedString == null || retrievedString == '' ) {
    localStorage.setItem(localStorageItem, '');
    var emptyarray = [];
    return emptyarray;
  } else {
    UserData.Sections = JSON.parse(retrievedString);
  }

  // console.log(UserData.Sections);
}


/**
  * @desc This is the workhorse of the learning journal. It finds all the Notes on the page
  *   and processes them depending on what type of Note it is
  * @param none
  * @return true if Notes were found
*/
function processNotes() {

    var $notes = $(noteSelector);
    var returnValue = ($notes.length > 0) ? true : false ;

    $notes.each( function() {
      switch (this.querySelector(noteContentsSelector).firstChild.innerText.trim()) {
        case flagEntry:
          processEntry( this );
          this.parentNode.removeChild(this);
          break;

        case flagSelect:
          processSelect( this );
          this.parentNode.removeChild(this);
          break;
        
        case flagSelectTwo:
          processSelectTwo( this );
          this.parentNode.removeChild(this);
          break;

        case flagRadio:
          processRadio( this );
          this.parentNode.removeChild(this);
          break;

        case flagButtons:
          processButtons( this);
          this.parentNode.removeChild(this);
          break;

        case flagIntro:
          processIntro( this );
          this.parentNode.removeChild(this);
          break;

        default:
          break;
      }

    });
    setSectionstoLocalStorage();
    return returnValue;
}


/**
  * @desc This processes an Entry. If successful, it updates UserData
  *   and renders the entry to DOM
  * @param jQueryObject note - the note to be processed
  * @return none
*/
function processEntry( note ) {

  var entry = createEntryfromNote( note );
  if ( entry ) {

    // use indexSection and indexEntry to determine if this is a new section and entry
    var indexSection = -1; indexEntry = -1;
    for (var i = 0; i < UserData.Sections.length; i++) {
      var currentSection = UserData.Sections[i];
      if ( currentSection.title == entry.section ) { indexSection = i; }
      for (var j = 0; j < currentSection.entries.length; j++ ) {
        if ( currentSection.entries[j].section == entry.section &&
          currentSection.entries[j].prompt == entry.prompt ) {
          indexEntry = j;
        }
      }
    }

    // New section, new entry
    if (indexSection == -1 && indexEntry == -1 ) {
      indexSection = UserData.Sections.length;
      indexEntry = 0;
      var newsection = new Section( entry.section );
      newsection.entries.push( entry );
      UserData.Sections.push( newsection );
    }

    // Existing section, new entry
    if (indexSection > -1 && indexEntry == -1 ) {
      indexEntry = UserData.Sections[indexSection].entries.length;
      UserData.Sections[indexSection].entries.push( entry );
    }

    // Existing section, existing entry
    if (indexSection > -1 && indexEntry > -1 ) {
      entry.response = UserData.Sections[indexSection].entries[indexEntry].response;
    }

    renderEntrytoDOM( note.parentNode, entry, indexSection, indexEntry );
  }
}

/**
  * @desc This processes an Select. If successful, it updates UserData
  *   and renders the entry to DOM
  * @param jQueryObject note - the note to be processed
  * @return none
*/
function processSelect( note ) {

    var entry = createEntryfromNote( note );
    
    if ( entry ) {
  
      // use indexSection and indexEntry to determine if this is a new section and entry
      var indexSection = -1; indexEntry = -1;
      for (var i = 0; i < UserData.Sections.length; i++) {
        var currentSection = UserData.Sections[i];
        if ( currentSection.title == entry.section ) { indexSection = i; }
        for (var j = 0; j < currentSection.entries.length; j++ ) {
          if ( currentSection.entries[j].section == entry.section &&
            currentSection.entries[j].prompt == entry.prompt ) {
            indexEntry = j;
          }
        }
      }
  
      // New section, new entry
      if (indexSection == -1 && indexEntry == -1 ) {
        indexSection = UserData.Sections.length;
        indexEntry = 0;
        var newsection = new Section( entry.section );
        newsection.entries.push( entry );
        UserData.Sections.push( newsection );
      }
  
      // Existing section, new entry
      if (indexSection > -1 && indexEntry == -1 ) {
        indexEntry = UserData.Sections[indexSection].entries.length;
        UserData.Sections[indexSection].entries.push( entry );
      }
  
      // Existing section, existing entry
      if (indexSection > -1 && indexEntry > -1 ) {
        entry.response = UserData.Sections[indexSection].entries[indexEntry].response;
      }
  
      renderSelecttoDOM( note.parentNode, entry, indexSection, indexEntry );
    }
  
}
function processSelectTwo( note ) {

  var entry = createEntryfromNote( note );
  if ( entry ) {

    // use indexSection and indexEntry to determine if this is a new section and entry
    var indexSection = -1; indexEntry = -1;
    for (var i = 0; i < UserData.Sections.length; i++) {
      var currentSection = UserData.Sections[i];
      if ( currentSection.title == entry.section ) { indexSection = i; }
      for (var j = 0; j < currentSection.entries.length; j++ ) {
        if ( currentSection.entries[j].section == entry.section &&
          currentSection.entries[j].prompt == entry.prompt ) {
          indexEntry = j;
        }
      }
    }

    // New section, new entry
    if (indexSection == -1 && indexEntry == -1 ) {
      indexSection = UserData.Sections.length;
      indexEntry = 0;
      var newsection = new Section( entry.section );
      newsection.entries.push( entry );
      UserData.Sections.push( newsection );
    }

    // Existing section, new entry
    if (indexSection > -1 && indexEntry == -1 ) {
      indexEntry = UserData.Sections[indexSection].entries.length;
      UserData.Sections[indexSection].entries.push( entry );
    }

    // Existing section, existing entry
    if (indexSection > -1 && indexEntry > -1 ) {
      entry.response = UserData.Sections[indexSection].entries[indexEntry].response;
    }

    renderSelectTwotoDOM( note.parentNode, entry, indexSection, indexEntry );
  }

}
function processRadio( note ) {

  var entry = createEntryfromNote( note );
  
  if ( entry ) {

    // use indexSection and indexEntry to determine if this is a new section and entry
    var indexSection = -1; indexEntry = -1;
    for (var i = 0; i < UserData.Sections.length; i++) {
      var currentSection = UserData.Sections[i];
      if ( currentSection.title == entry.section ) { indexSection = i; }
      for (var j = 0; j < currentSection.entries.length; j++ ) {
        if ( currentSection.entries[j].section == entry.section &&
          currentSection.entries[j].prompt == entry.prompt ) {
          indexEntry = j;
        }
      }
    }

    // New section, new entry
    if (indexSection == -1 && indexEntry == -1 ) {
      indexSection = UserData.Sections.length;
      indexEntry = 0;
      var newsection = new Section( entry.section );
      newsection.entries.push( entry );
      UserData.Sections.push( newsection );
    }

    // Existing section, new entry
    if (indexSection > -1 && indexEntry == -1 ) {
      indexEntry = UserData.Sections[indexSection].entries.length;
      UserData.Sections[indexSection].entries.push( entry );
    }

    // Existing section, existing entry
    if (indexSection > -1 && indexEntry > -1 ) {
      entry.response = UserData.Sections[indexSection].entries[indexEntry].response;
    }

    renderRadiotoDOM( note.parentNode, entry, indexSection, indexEntry );
  }

}


/**
  * @desc renders an Entry to DOM.
  * @param DOMElement parentcontainer - entry's parent container
  * @param Entry entry - the entry
  * @param string sectionid - the id of the corresponding section in UserData.Sections
  * @param string entryid - the id on the entry within UserData.Sections
  * @return none
*/
function renderEntrytoDOM( parentcontainer, entry, sectionid, entryid ) {

    // create container
    var container = document.createElement("div");
    container.className = "journalentry-container journalentry-textarea-wrap";
    container.dataset.sectionid = sectionid;
    container.dataset.entryid = entryid;

    // create prompt
    var prompt = document.createElement("div");
    prompt.className = "journalentry-prompt";
    prompt.innerText = entry.prompt;
    container.appendChild( prompt );

    // create response
    var response = document.createElement("textarea");
    response.className = "journalentry-response";
    response.value = entry.response;
    container.appendChild(response);
    parentcontainer.appendChild(container);

    $( ".block-impact--note:has( .journalentry-container)").addClass("block-impact--note-journalentry");
}

/**
  * @desc renders an Select to DOM.
  * @param DOMElement parentcontainer - entry's parent container
  * @param Entry entry - the entry
  * @param string sectionid - the id of the corresponding section in UserData.Sections
  * @param string entryid - the id on the entry within UserData.Sections
  * @return none
*/
function renderSelecttoDOM( parentcontainer, entry, sectionid, entryid ) {

  // console.log(entry);

    // create container
    var container = document.createElement("div");
    container.className = "journalentry-container journalentry-select-wrap journalentry-select-one";
    container.dataset.sectionid = sectionid;
    container.dataset.entryid = entryid;

    // create prompt
    var prompt = document.createElement("div");
    prompt.className = "journalentry-prompt";
    prompt.innerText = entry.prompt;
    container.appendChild( prompt );    

    // create response
    var response = document.createElement("select");

    var optionsList = entry.option,
        optionsListArr =optionsList.split(',');

    for (var i = 0; i<optionsListArr.length; i++){
        var opt = document.createElement('option');
        opt.value =optionsListArr[i];
        opt.innerHTML = optionsListArr[i];
        response.appendChild(opt);
    }

    response.className = "journalentry-response journalentry-select";
    response.value = entry.response;

    //create select wrap
    var wrap = document.createElement("div");
    wrap.className = "select-wrapper";

    wrap.appendChild(response);
    container.appendChild(wrap);

    parentcontainer.appendChild(container);

    $( ".block-impact--note:has( .journalentry-container)").addClass("block-impact--note-journalentry");
}
function renderSelectTwotoDOM( parentcontainer, entry, sectionid, entryid ) {

  // create container
  var container = document.createElement("div");
  container.className = "journalentry-container journalentry-select-wrap journalentry-select-two";
  container.dataset.sectionid = sectionid;
  container.dataset.entryid = entryid;

  // create prompt
  var prompt = document.createElement("div");
  prompt.className = "journalentry-prompt";
  prompt.innerText = entry.prompt;
  container.appendChild( prompt );
  

  // var disabledSelect = document.createElement("select");
  var disabledSelect = document.createElement("div");

  if(localStorage.length){
    for (var i = 0; i < UserData.Sections.length; i++) {
      var currentSection = UserData.Sections[i];

      // console.log(currentSection);

      if ( currentSection.title == 'Self-Assessment' ){

        for (var j = 0; j < currentSection.entries.length; j++ ) {
          console.log(currentSection.entries[j]);
          if(currentSection.entries[j].prompt == entry.prompt){
            var valS = currentSection.entries[j].response;
            // var opt = document.createElement('option');
            var opt = document.createElement('span');
            // opt.value = valS;
            opt.innerHTML = valS;

            disabledSelect.appendChild(opt);

            // disabledSelect.value = valS;
          }
        }        
      }
    }
  }

  // for (var i = 1; i<=9; i++){
  //     var opt = document.createElement('option');
  //     opt.value = i;
  //     opt.innerHTML = i;
  //     disabledSelect.appendChild(opt);
  // }
  disabledSelect.disabled = true;
  disabledSelect.className = "journalentry-select journalentry-select-disabled";
  
  container.appendChild(disabledSelect);

  // create response
  var response = document.createElement("select");

  var optionsList = entry.option,
      optionsListArr =optionsList.split(',');

    for (var i = 0; i<optionsListArr.length; i++){
        var opt = document.createElement('option');
        opt.value =optionsListArr[i];
        opt.innerHTML = optionsListArr[i];
        response.appendChild(opt);
    }

  // for (var i = 1; i<=9; i++){
  //     var opt = document.createElement('option');
  //     opt.value = i;
  //     opt.innerHTML = i;
  //     response.appendChild(opt);
  // }
  response.className = "journalentry-response journalentry-select";
  response.value = entry.response;
  container.appendChild(response);
  parentcontainer.appendChild(container);

  $( ".block-impact--note:has( .journalentry-container)").addClass("block-impact--note-journalentry");
}
function renderRadiotoDOM( parentcontainer, entry, sectionid, entryid ) {

  var container = document.createElement("div");
  container.className = "journalentry-container journalentry-radio-wrap";
  container.dataset.sectionid = sectionid;
  container.dataset.entryid = entryid;

  // create prompt
  var prompt = document.createElement("div");
  prompt.className = "journalentry-prompt";
  prompt.innerText = entry.prompt;
  container.appendChild( prompt );    

  // create response
  var response = document.createElement("div");

  var optionsList = entry.option,
      optionsListArr = optionsList.split(',');

  for (var i = 0; i<optionsListArr.length; i++){

    var label = document.createElement("label");
    var span = document.createElement("span");
    var radio = document.createElement("input");
    radio.type = "checkbox";
    radio.name = 'checkbox_name';
    radio.value = optionsListArr[i];

    label.appendChild(radio);
    label.appendChild(span);
    label.appendChild(document.createTextNode(optionsListArr[i]));

    response.appendChild(label);
  }

  response.className = "journalentry-response journalentry-radio-list";
  response.value = entry.response;

  //create select wrap
  var wrap = document.createElement("div");
  wrap.className = "radio-wrapper";

  wrap.appendChild(response);
  container.appendChild(wrap);

  parentcontainer.appendChild(container);

  var checkedListArr = [];
  if(localStorage.length){
    for (var i = 0; i < UserData.Sections.length; i++) {
      var currentSection = UserData.Sections[i];

      // console.log(currentSection);

      if ( currentSection.title == "Daniel's therapy journey-Part I" ){

        for (var j = 0; j < currentSection.entries.length; j++ ) {
          
          var currentEntry = currentSection.entries[j];
          if(currentEntry.prompt == "Strategy 1 - Competency applied:" || currentEntry.prompt =="Strategy 2 - Competency applied:" || currentEntry.prompt =="Strategy 3 - Competency applied:"){
            if(currentEntry.response!=null && currentEntry.response!=""){
              checkedListArr.push(currentEntry.response);
            }
          }           
        }  

      } else if( currentSection.title == "Daniel's therapy journey-Part II" ){
        for (var j = 0; j < currentSection.entries.length; j++ ) {
          
          var currentEntry = currentSection.entries[j];
          if(currentEntry.prompt == "Strategy 4 - Competency applied:" || currentEntry.prompt =="Strategy 5 - Competency applied:"){
            if(currentEntry.response!=null && currentEntry.response!=""){
              checkedListArr.push(currentEntry.response);
            }
          }           
        } 
      } else if ( currentSection.title == "Daniel's therapy journey-Part III" ){
        for (var j = 0; j < currentSection.entries.length; j++ ) {
          
          var currentEntry = currentSection.entries[j];
          if(currentEntry.prompt == "Strategy 6 - Competency applied:" || currentEntry.prompt =="Strategy 7 - Competency applied:"){
            if(currentEntry.response!=null && currentEntry.response!=""){
              checkedListArr.push(currentEntry.response);
            }
          }           
        } 
      }
    }    

    $('#app [name="checkbox_name"]').each(function(){
      var $this = $(this),
          currentVal = $this.val();

      for (let v = 0; v < checkedListArr.length; v++) {
        const element = checkedListArr[v];

        if (currentVal == element){
          $this.prop('checked', true);
        }
      }
      
    })

    console.log(checkedListArr)
  }

  $( ".block-impact--note:has( .journalentry-container)").addClass("block-impact--note-journalentry");
}


/**
  * @desc creates an Entry object from a Note.
  * @param DOMElement note - note from which to create the entry
  * @return Entry object or null if fail (section or prompt is empty)
*/
function createEntryfromNote( note ) {

    var section = '',
        prompt = '',
        option = '',
        isTakeAction = false;

  var notecontents = note.querySelector(noteContentsSelector);

  for (var i = 0; i< notecontents.childNodes.length; i++ ) {
    var a = notecontents.childNodes[i];

    // set the section
    if ( a.innerText.substring(0,sectionlabel.length) == sectionlabel ) {
      section = a.innerText.substring(sectionlabel.length).trim();
    }
    // set the prompt
    if ( a.innerText.substring(0,promptlabel.length) == promptlabel ) {
      prompt = a.innerText.replace(promptlabel, "").trim();
    }
    // set the options for Select
    if ( a.innerText.substring(0,optionlabel.length) == optionlabel ) {
      option = a.innerText.replace(optionlabel, "").trim();
    }
    // set the takeaction
    if ( a.innerText.substring(0,takeactionlabel.length) == takeactionlabel ) {
      var TakeActiontext = a.innerText.replace(takeactionlabel, "").trim();
      if ( TakeActiontext.toLowerCase() == "yes" ) { isTakeAction = true }
    }
  }

  if (section != '' && prompt != '' && option != '') {
    return new Entry( section, prompt, '', isTakeAction, option); // response is added later
  } else if (section != '' && prompt != '') {
    return new Entry( section, prompt, '', isTakeAction, option); // response is added later
  } else {
    return null;
  }
}


/**
  * @desc This processes the Buttons. It updates sets the courseTitle variable
  *   and renders the buttons to DOM
  * @param DOMElement note - note
  * @return none
*/
function processButtons( note ) {

  var includeEmailButton = false;
  var emailAddress = '';

  // Set Course Title
  var notecontents = note.querySelector(noteContentsSelector);
  for (var i = 0; i< notecontents.childNodes.length; i++ ) {
    var a = notecontents.childNodes[i];

    // Set the Course Title
    if ( a.innerText.substring(0,coursetitlelabel.length) == coursetitlelabel ) {
      courseTitle = a.innerText.substring(coursetitlelabel.length).trim();
    }

    // Include an Email button
    if ( a.innerText.substring(0,includeEmailButtonLabel.length) == includeEmailButtonLabel ) {
      var emailButtonSetting = a.innerText.replace(includeEmailButtonLabel, "").trim();
      if ( emailButtonSetting.toLowerCase() == "yes" ) { includeEmailButton = true }
    }

    // Email address to which the journals will be emailed
    if ( a.innerText.substring(0,emailAddressLabel.length) == emailAddressLabel ) {
      emailAddress = a.innerText.substring(emailAddressLabel.length).trim();
    }
  }

  // Render buttons to DOM
  var container = document.createElement("div");
  container.className = "journalbuttons-container";

  var button1 = document.createElement("div");
  button1.className = "journalprintbutton";
  button1.innerText = PrintAllButton_Text;
  button1.addEventListener("click", function() { printEntries(false)} );
  container.appendChild(button1);

  var button2 = document.createElement("div");
  button2.className = "journalprintbutton";
  button2.innerText = PrintTakeActionsOnly_Text;
  button2.addEventListener("click", function() { printEntries(true)} );
  container.appendChild(button2);
  note.parentNode.appendChild(container);

  if ( includeEmailButton ) {
    var button3 = document.createElement("div");
    button3.className = "journalprintbutton";
    button3.innerText = EmailButton_Text;
    button3.addEventListener("click", function() { emailEntries( emailAddress )} );
    container.appendChild(button3);
    note.parentNode.appendChild(container);
  }
}


/**
  * @desc This processes a Section Intro, saving the intro information to UserData
  * @param DOMElement note - note
  * @return none
*/
function processIntro( note ) {

  var notecontents = note.querySelector(noteContentsSelector);
  var introsection = '', introSectionOrder = 999, introtitle = '', introtext = '';
  for (var i = 0; i< notecontents.childNodes.length; i++ ) {
    var a = notecontents.childNodes[i];

    // set the intro section
    if ( a.innerText.substring(0,introsectionlabel.length) == introsectionlabel ) {
      introsection = a.innerText.substring(introsectionlabel.length).trim();
    }
    // set the intro section index
    if ( a.innerText.substring(0,introSectionOrderLabel.length) == introSectionOrderLabel ) {
      introSectionOrder = parseInt(a.innerText.substring(introSectionOrderLabel.length).trim());
      if ( introSectionOrder !== introSectionOrder ) { //  is not a number
        introSectionOrder = 999
      }
    }
    // set the intro title
    if ( a.innerText.substring(0,introtitlelabel.length) == introtitlelabel ) {
      introtitle = a.innerText.substring(introtitlelabel.length).trim();
    }
    // set the intro text
    if ( a.innerText.substring(0,introtextlabel.length) == introtextlabel ) {
      introtext = a.innerText.replace(introtextlabel, "").trim();

      // grab the rest of the Note for the text also
      i++;
      while (i < notecontents.childNodes.length) {
        introtext += "<br /><br />" + notecontents.childNodes[i].innerText;
        i++;
      }
    }
  }

  if (introsection != '' && introtitle != '' && introtext != '') {
    var sectionMatch = -1;
    for (var j = 0; j < UserData.Sections.length; j++) {
      if ( UserData.Sections[j].title == introsection ) { sectionMatch = j; }
    }

    if (sectionMatch == -1) {
      // new section
      UserData.Sections.push( new Section( introsection, introSectionOrder, introtitle, introtext ) );
    } else {
      // existing section
      UserData.Sections[sectionMatch].order = introSectionOrder;
      UserData.Sections[sectionMatch].introtitle = introtitle;
      UserData.Sections[sectionMatch].introtext = introtext;
    }
    UserData.Sections.sort( compareOrders )
  }

  // SUB function
  // Sorts an array of objects on a particular property
  function compareOrders( a, b ) {
    if ( a.order < b.order ){
      return -1;
    }
    if ( a.order > b.order ){
      return 1;
    }
    return 0;
  }
}


// Set up autosave of journal entries to UserData and to localStorage
// see https://stackoverflow.com/questions/4220126/run-javascript-function-when-user-finishes-typing-instead-of-on-key-up?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
$(document).on('keyup change', '.journalentry-response', function(){
    clearTimeout(typingTimer);
    // var myentrycontainer = this.parentNode;
    var myentrycontainer = $(this).closest('.journalentry-container');

    typingTimer = setTimeout(function() {      
      var response = myentrycontainer.find('.journalentry-response').val();
      var sectionid = myentrycontainer.data('sectionid');
      var entryid = myentrycontainer.data('entryid');

      UserData.Sections[sectionid].entries[entryid].response = response;

      console.log(UserData.Sections); 

      // if(myentrycontainer.find('.journalentry-select').length){

      //   var selectList = $('.journalentry-select-one[data-sectionid="'+sectionid+'"] select');

      //   console.log(selectList)
  
      //   selectList.each(function(){
      //     var currentVal = $(this).val();

      //     console.log(currentVal)
  
      //     if (response != currentVal){
      //       $(this).find('option[value="'+response+'"]').prop('disabled', true);
      //     }
      //   }) 
      // }      

      setSectionstoLocalStorage();
      
    }, doneTypingInterval);
});

$(document).on('change', '.journalentry-select', function(){  
  
  var entryId = $(this).closest('.journalentry-select-wrap').data('entryid'),
      sectionId = $(this).closest('.journalentry-select-wrap').data('sectionid'),
      sectionValue = UserData.Sections[sectionId].entries[entryId].response;

      console.log(sectionId);

  console.log(UserData.Sections[sectionId].entries[entryId].response);

  // setTimeout(function() {  
    var selectList = $('.journalentry-select-wrap[data-sectionid="'+sectionId+'"] select');

    console.log(selectList)

    var seletArr = [];

    selectList.each(function(){
      var currentVal = $(this).val();

      if(currentVal!=null){
        seletArr.push(currentVal);      
      }      

      $('.journalentry-select-wrap[data-sectionid="'+sectionId+'"] select option').each(function(){ 

        $(this).prop('disabled', false);

        var thisVal = $(this).text()

        for (let i = 0; i < seletArr.length; i++) {
          const e = seletArr[i];  

          if( !$(this).is(':selected') && thisVal == e ){
            $(this).prop('disabled', true);
          }      
          
        }
        
      })

      

      // if (sectionValue != currentVal){
      //   $(this).find('option[value="'+sectionValue+'"]').prop('disabled', true);
      // }
    }) 
  // }, 1000);
})


/**
  * @desc prints the entries by opening a new browser window with a print button on it
  * @param bool TakeActionsOnly - are we printing all or simply Take Actions?
  * @return none
*/
function printEntries( TakeActionsOnly ) {

  var printtitle = ( TakeActionsOnly ) ? "Take Action Items" : "Learning Journal";
  var printCommand = (isFirefox)
		? 'window.print()'
		: 'document.execCommand(\"print\", false, null);';
	var date = getDate();

	var contents = "<html><head></head><body>"
  contents+= "<div class='no-print printbutton' ><button onclick='" + printCommand + "'>" +
    "Print My " + printtitle + "</button></div>";
	contents+="<div class='headertext' >" + courseTitle + " " + printtitle + "</div>";
	contents+="<div class='date' >"+date+"</div>";

  // print each entry if applicable
  for (var i = 0; i< UserData.Sections.length; i++ ) {
       var currentSection = UserData.Sections[i];

       var sectionheader = "<div class='sectiontitle' >Section: " + currentSection.title + "</div>";
       if ( currentSection.introtitle ) {
         sectionheader +=
           "<div class='sectionintrocontainer' >" +
             "<img class='sectionintroicon' src='" + imageIntroHeader + "' />" +
             "<div class='sectionintrotextcontainer'>" +
               "<div class='sectionintrotitle'>" + currentSection.introtitle + "</div>" +
               "<div class='sectionintrotext'>" + currentSection.introtext + "</div>" +
           "</div></div>";
       }


       var sectioncontents = '';
       for (var j = 0; j< currentSection.entries.length; j++ ) {
          if ( (!TakeActionsOnly || currentSection.entries[j].isTakeAction == true) &&
                currentSection.entries[j].response != '' ) {
            sectioncontents+="<div class='prompt' >" + currentSection.entries[j].prompt + "</div>";
            sectioncontents+="<div class='response' >" + currentSection.entries[j].response + "</div>";
          }
       }
       if (sectioncontents != '' ) {
          contents+= "<div class='sectionarea'>" + sectionheader + sectioncontents + "</div>";
          if (i != UserData.Sections.length - 1 ) { contents+= "<div class='pagebreak'></div>" }
       }
    //}
  }

	contents+= "</body></html>"

  var myWindow = window.open("","Print " + getTimestamp(),"width=810,height=610,scrollbars=1,resizable=1");
	myWindow.document.write(contents);

	var myStringOfstyles =  "@media print { .no-print, .no-print * { display: none !important; } }" +
							"body { width:650px;padding:20px;font-family:sans-serif }" +
							".printbutton { height:20px;padding:10px;margin-bottom:20px;text-align:center; }" +
							".headertext { text-transform: uppercase;text-align:center;font-size:22px; " +
              "    font-weight:bold;margin-bottom:20px; background-color: #4c4c4c !important; " +
              "    -webkit-print-color-adjust: exact;color: white; padding: 15px 20px; }" +
							".date { font-size:16px;font-weight:bold;text-align: center;margin-bottom: 30px }" +
              ".sectionarea { margin-bottom:80px;}" +
              ".sectionintrocontainer { margin-bottom: 5px; color: black; padding: 25px 20px;}" +
              ".sectionintroicon { height: 160px;  display: inline-block; padding: 0px 20px}" +
              ".sectionintrotextcontainer { display: inline-block; width: 330px; vertical-align: top;" +
              "    padding-left:20px}" +
              ".sectionintrotitle { font-weight: bold; font-size: 15pt;margin-bottom: 12px;}" +
              ".sectionintrotext { line-height: 18pt;}" +
              ".sectiontitle { font-weight: bold; margin-bottom: 10px;}" +
              ".pagebreak { page-break-before: always; }" +
              ".response { font-size: 11pt;border: 1.5px gray solid;padding: 15px;" +
              "    margin-bottom: 20px;white-space: pre-wrap; margin-top: 0px; }" +
							".prompt { font-size: 16px; background-color: #4c4c4c !important; " +
              "    -webkit-print-color-adjust: exact;color: white; font-weight: bold; " +
              "    padding: 8px 10px;line-height:15pt; }";
							//".section { font-size: 18px;font-weight:bold;margin-top: 50px;text-align: center;margin-bottom: 15px  }";
	var linkElement = myWindow.document.createElement('link');
	linkElement.setAttribute('rel', 'stylesheet');
	linkElement.setAttribute('type', 'text/css');
	linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(myStringOfstyles));
	myWindow.document.head.appendChild(linkElement);

  var titleElement = myWindow.document.createElement('title');
  var t = myWindow.document.createTextNode("Print " + printtitle);
  titleElement.appendChild(t);
  myWindow.document.head.appendChild(titleElement);

  // sub-function
  function getDate() {
    var m_names = new Array("January", "February", "March",
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December");
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth();
    var yyyy = today.getFullYear();
    if(dd<10) { dd='0'+dd }
    return m_names[mm]+' '+dd+', '+yyyy;
  }
}


/**
  * @desc emails the entries
  * @param none
  * @return none
*/
function emailEntries( emailAddress ) {

  var printtitle = "Learning Journal";
  var lineBreak = '%0D';
	var contents = courseTitle + lineBreak + printtitle + lineBreak + lineBreak;
  contents+= "------------------------------" + lineBreak;

  // print each entry if applicable
  for (var i = 0; i< UserData.Sections.length; i++ ) {
       var currentSection = UserData.Sections[i];

       var sectionheader = "Section: " + currentSection.title + lineBreak;
       if ( currentSection.introtitle ) {
         sectionheader +=
           currentSection.introtitle + lineBreak +
           currentSection.introtext + lineBreak + lineBreak;
       }


       var sectioncontents = '';
       for (var j = 0; j< currentSection.entries.length; j++ ) {
          if ( currentSection.entries[j].response != '' ) {
            sectioncontents+= currentSection.entries[j].prompt + lineBreak;
            sectioncontents+= currentSection.entries[j].response + lineBreak + lineBreak;
          }
       }
       if (sectioncontents != '' ) {
          contents+= sectionheader + sectioncontents;
          if (i != UserData.Sections.length - 1 ) { contents+= "------------------------------" + lineBreak }
       }
    //}
  }


  window.open('mailto:' + emailAddress +
              '?subject=My Learning Journal&body=' + contents);


}



/**
  * @desc returns timestamp in the form of yyyymmddhhmmss
  * @param none
  * @return string
*/
function getTimestamp() {
    var today = new Date();
    var mm = today.getMonth()+1;
    if(mm<10) { mm='0'+mm }
    var dd = today.getDate();
    if(dd<10) { dd='0'+dd }
    var hh = today.getHours();
    if(hh<10) { hh='0'+hh }
    var min = today.getMinutes();
    if(min<10) { min='0'+min }
    var sec = today.getSeconds();
    if(sec<10) { sec='0'+sec }
    return today.getFullYear() + mm + dd + hh+ min + sec ;
}

// Polyfill for isNaN
Number.isNaN = Number.isNaN || function(value) {
    return value !== value;
}