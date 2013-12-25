var login_id_name_model = Ext.define('login_id_name_model', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',      type: 'INT'},
        {name: 'name',    type: 'text'}
    ],
    idProperty: 'id'
});

var login_db_name_list = Ext.create('Ext.data.Store', {
  model: 'login_id_name_model',
  autoDestroy: true,
  proxy: {
      // load using HTTP
      type: 'ajax',
      url: 'ajax/db_list.php',
      reader: {
        type: 'json'
      }
  }
}); //login_db_name_list

var login_db_name_list_cb = Ext.create('Ext.form.field.ComboBox', {
  store: login_db_name_list,
  id: "login_db_name_list_cb",
  name: "login_db_name_list_cb",
  fieldLabel: 'База',
  labelWidth: 100,
  displayField: 'name',
  valueField: 'id',
  queryMode: 'local',
  allowBlank: false,
  value: 1,
  editable: false,
  listeners: {
    select: function( combo, records, e) {
      if(records != undefined && records[0].get('id') != 0) {
        db_id = records[0].get('id');
        login_usr_name_list.proxy.url = 'ajax/usr_list_name.php?DB_ID=' + db_id;
          
        login_usr_name_list.load();
        login_usr_name_list_cb.clearValue();
        Ext.getCmp('password').focus(false, 100);
      }
    }
  }
}); //login_db_name_list_cb


var login_usr_name_list = Ext.create('Ext.data.Store', {
  model: 'login_id_name_model',
  autoDestroy: true,
  proxy: {
      // load using HTTP
      type: 'ajax',
      url: 'ajax/usr_list_name.php?DB_ID=1',
      reader: {
        type: 'json'
      }
  }
}); //login_usr_name_list

var login_usr_name_list_cb = Ext.create('Ext.form.field.ComboBox', {
    store: login_usr_name_list,
    id: "login_usr_name_list_cb",
    name: "login_usr_name_list_cb",
    fieldLabel: 'Имя',
    labelWidth: 100,
    editable: false,
    displayField: 'name',
    valueField: 'id',
    queryMode: 'local',
    allowBlank: false,
    value: 1,
    listeners: {
      select: function( combo, records, e) {
        Ext.getCmp('password').setValue("");
        Ext.getCmp('password').focus(false, 100);
      }
    }
}); //login_usr_name_list_cb

function submt() {
  if(Ext.getCmp('password').getValue() == "") return;
  var form = Ext.getCmp('loginForm').getForm();
  form.submit({
      waitTitle: 'Пожалуйста подождите...',
      waitMsg: 'Вход в систему выполняется',
      success: function(form, action) {
        authOk(action.result.msg);
      },
      failure: function(form, action) {
        error(action.result.msg);
        Ext.getCmp('password').focus(false, 100);
      }
  });
}

var loginForm = new Ext.FormPanel({
  url:'ajax/login.php',
  bodyPadding: 5,
  id: "loginForm",
  frame: true,
  items: [login_db_name_list_cb, login_usr_name_list_cb,
      {
        xtype: 'textfield',
        fieldLabel:'Пароль',
        name:'password',
        id: "password",
        inputType:'password',
        anchor: '90%',
        allowBlank:false
      }
  ],
  listeners: {
    afterRender: function(thisForm, options){
        this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
            enter: submt,
            scope: this
        });
    }
  },
  buttons: [
      {
        text: 'Войти',
        formBind: true,
        disabled: true,
        handler: function() {
            submt();
        }
      }
  ]
});

var loginWindow = new Ext.Window({
  frame:true,
  border: false,
  title:'Вход в бухгалтерию',
  width:330,
  closable: false,
  resizable: false,
  items: loginForm,
  listeners: {
    show: function(){
      login_db_name_list.load(function() {
        
        var db_id = Ext.util.Cookies.get("DB_ID");
        if( db_id != undefined && parseInt(db_id) > 0 ) {
          login_db_name_list_cb.setValue(parseInt(db_id));
          login_usr_name_list.proxy.url = 'ajax/usr_list_name.php?DB_ID=' + db_id;
        }
        
        login_usr_name_list.load(function() {
          var uid = Ext.util.Cookies.get("USR_ID");
          if( uid != undefined && parseInt(uid) > 0 ) {
            login_usr_name_list_cb.setValue(parseInt(uid));
          }
          Ext.getCmp('password').focus(false, 100);
          Ext.getCmp('password').setValue("");
          if(db_id == 1 && uid == 1 && 1 == settings.demo) { //demo
            Ext.getCmp('password').setValue("admin");
          }
        });
      });
    }
  }
});