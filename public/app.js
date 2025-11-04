window.addEventListener('load', function () {
    let socket = io();
    
    let msgInput = document.getElementById('confession-input');
    let submitButton = document.getElementById('confession-submit');

    socket.on('msg', function (data) {
        window.onNewConfession({ msg: data.msg });
    });

    submitButton.addEventListener('click', function () {
        let currentMsg = msgInput.value;
        
        if (currentMsg.trim() == '') {
            alert('Please write something before sending!');
            return;
        }
        
        socket.emit('msg', { msg: currentMsg });
        msgInput.value = "";
    });

    msgInput.addEventListener('keydown', function(e) {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitButton.click();
        }
    });
});