document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //  Get inbox data
  fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
    // Print emails
    console.log(emails);


   // Create inbox header
   const div = document.createElement('div');
   div.id = 'inbox-header';
   div.className = 'row';
   div.innerHTML = '<span id="inbox-sender" class="col-4">Sender</span><span class="col-4">Subject</span><span class="col-4">Date and Time</span>';
   document.querySelector('#emails-view').append(div);

    // ... Create divs for each inbox item ...
    function createInboxList(item) {
      console.log(item);
      const emails_view = document.querySelector('#emails-view');
      const div = document.createElement('div');

      // add items to inbox which are not archived
      if(item['archived'] === false ){
          if(item['read'] === false){
            div.id = 'unread';
            div.className = 'row';
            div.innerHTML = `<span id="inbox-sender" class="col-4">${item['sender']}</span><span class="col-4">${item['subject']}</span><span class="col-4">${item['timestamp']}</span>`;
          }
          else {
            div.id = 'read';
            div.innerHTML = item['sender'];
          }
          emails_view.append(div);
      }

    }

    emails.forEach(createInboxList);


});

}