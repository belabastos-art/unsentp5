window.addEventListener('load', function () {

    //Open and connect socket
    let socket = io();
    
    //Listen for connection confirmation
    socket.on('connect', function () {
        console.log('Connected');
    });

    // Get DOM elements
    let msgInput = document.getElementById('confession-input');
    let submitButton = document.getElementById('confession-submit');

    //Listen for messages named "msg" from the server
    socket.on('msg', function (data) {
        console.log('New confession arrived!');
        console.log(data);

        // Add envelope to p5 canvas
        if (window.onNewConfession) {
            window.onNewConfession({ msg: data.msg });
        }
    });

    //Send a socket message to the server when button clicked
    submitButton.addEventListener('click', function () {
        let currentMsg = msgInput.value;
        
        if (currentMsg.trim() === '') {
            alert('Please write something before sending!');
            return;
        }
        
        let msgObj = { "msg": currentMsg };

        //Send the message object to the server
        socket.emit('msg', msgObj);

        //Clear input box
        msgInput.value = "";
        
        console.log('Confession sent!');
    });

    // Also allow Enter key to submit (but Shift+Enter for new line)
    msgInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitButton.click();
        }
    });

});
