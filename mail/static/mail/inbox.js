document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener("submit" , (event) => send_email(event));


  // By default, load the inbox
  load_mailbox('inbox');

});

function send_email(event){
    event.preventDefault();
    console.log("starting email sending request");
    fetch('/emails',
    {
      method : 'POST',
      body : JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        //console.log(result);
          document.querySelector('#compose-recipients').value = '';
          document.querySelector('#compose-subject').value = '';
          document.querySelector('#compose-body').value = '';
          load_mailbox('sent');
    });
    return false;
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function view_email(email_id) {
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';


    const div = document.querySelector('#email-view');
    // clear div
    div.innerHTML = '';

    const username = document.querySelector('#username').innerHTML;
    // console.log(username);

    // Change entry in the DB and mark email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });


    fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {

        // Add HTML elements with information
        console.log(email);
        const header = document.createElement('div');
        header.innerHTML = `<span>From: </span>${email['sender']}<br>
                            <span>To: </span>${email['recipients'].join('; ')}<br>
                            <span>Subject: </span>${email['subject']}<br>
                            <span>Date: </span>${email['timestamp']}<br>
                            <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
                            <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button><br>
                            <hr>
                            <div id="email-body">${email['body']}</div>`;

        header.id = "email-header";

        div.append(header);
        console.log(`${username} === ${email.sender} ==> ${username === email.sender}`);
        // Check if email is archived if so change the Archive to Un-Archive and id archive to id unarchive
        if (email['archived'] === true) {
            document.querySelector('#archive').innerHTML = 'Un-Archive';
            document.querySelector('#archive').id = 'unarchive';
              // if user clicks on unarchive it will change the archived to false
                document.querySelector('#unarchive').addEventListener('click', () => {
                fetch(`/emails/${email_id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: false
                  })

                })
                setTimeout(function() { load_mailbox('inbox'); }, 250);

            });
         }
        else {
            // if clicked on archive it will change archived to true
                document.querySelector('#archive').addEventListener('click', () => {
                fetch(`/emails/${email_id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })

                })
                // load_mailbox('archive');
                setTimeout(function() { load_mailbox('inbox'); }, 250);

            });
        }


        // disable Archive button if user === sender since this is not required
        if (username === email.sender) {
            document.querySelector('#archive').remove();
        }


     });


}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //  Get inbox data
  fetch(`/emails/${mailbox}`)
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

          if(item['read'] === false){
            div.id = 'unread';
            div.className = 'row';
            div.style = "cursor: pointer";
            div.innerHTML = `<span id="inbox-sender" class="col-4">${item['sender']}</span><span class="col-4">${item['subject']}</span><span class="col-4">${item['timestamp']}</span>`;
          }
          else {
            div.id = 'read';
            div.className = 'row';
            div.style = "cursor: pointer";
            div.innerHTML = `<span id="inbox-sender" class="col-4">${item['sender']}</span><span class="col-4">${item['subject']}</span><span class="col-4">${item['timestamp']}</span>`;
          }


          // Tell browser what to do when user clicks on the email listing
          div.addEventListener("click", () => {
              //console.log(`click: ${item['id']}`);
              view_email(item['id']);
          });
          emails_view.append(div);



    }

    emails.forEach(createInboxList);


});

}


