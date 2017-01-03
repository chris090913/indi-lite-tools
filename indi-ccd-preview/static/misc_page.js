var MiscPage = function(localsettings, indi) {
    this.localsettings = localsettings;
    this.indi = indi;
    MiscPage.SETTING_RUN_COMMAND='setting_run_command';

    this.run_command = function() {
        var command = $('#run-command').val();
        this.localsettings.set(MiscPage.SETTING_RUN_COMMAND, command);
        $.ajax('/run_command', {method: 'POST', data: {command: command}});
    };

    $('#shutdown-server').click(function() {
        $.ajax('/shutdown', {success: function(){
            notification('danger', 'Shutdown', 'Server is shutting down...');
        }});
    });

    $('#clean-cache').click(function() {
        $.ajax('/clean-cache', {success: function(data){
            level = data['files'] == 0 ? 'success' : 'warning';
            notification(level, 'Clean cache', 'Cache cleared, files remaining: ' + data['files'], 5);
        }});
    });

    $('#run-command-btn').click(this.run_command.bind(this));
    $('#run-command').val(localsettings.get(MiscPage.SETTING_RUN_COMMAND), '');
};
