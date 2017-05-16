
//sValidation=nyfjs
//sCaption=Export OPML document ...
//sHint=Export items in the current branch as .opml document
//sCategory=MainMenu.Share
//sLocaleID=p.ExportOpml
//sAppVerMin=6.0.9
//sShortcutKey=

var _lc=function(sTag, sDef){return plugin.getLocaleMsg(sTag, sDef);};
var _lc2=function(sTag, sDef){return _lc(plugin.getLocaleID()+'.'+sTag, sDef);};

var _trim=function(s){return (s||'').replace(/^\s+|\s+$/g, '');};
var _trim_cr=function(s){return (s||'').replace(/\r+$/g, '');};

var _validate_filename=function(s){
	s=s||'';
	s=s.replace(/[\*\?\.\(\)\[\]\{\}\<\>\\\/\!\$\^\&\+\|,;:\"\'`~@]/g, ' ');
	s=s.replace(/\s{2,}/g, ' ');
	s=_trim(s);
	if(s.length>64) s=s.substr(0, 64);
	s=_trim(s);
	s=s.replace(/\s/g, '_');
	return s;
};

try{

	var xNyf=new CNyfDb(-1);
	if(xNyf.isOpen()){

		var sCurItem=plugin.getCurInfoItem(-1);
		var sItemTitle=xNyf.getFolderHint(sCurItem);

		var sDstFn=platform.getSaveFileName(
			{ sTitle: ''
			, sFilter: 'OPML documents (*.opml)|*.opml|All files (*.*)|*.*'
			, sDefExt: '.opml'
			, bOverwritePrompt: true
			, sFilename: _validate_filename(sItemTitle)||'untitled'
			});

		if(sDstFn){

			var nFolders=0;

			//To estimate the progress range;
			//xNyf.traverseOutline(sCurItem, true, function(){
			//	nFolders++;
			//});

			plugin.initProgressRange(plugin.getScriptTitle(), nFolders);

			/*var sXml=new CLocalFile('D:/mysoft/vc/bak-mybase/User-Files/states.opml').loadText();
			if(sXml){
				var xml=new CXmlDocument();
				xml.unserialize(sXml);
				alert(xml.serialize());
			}*/

			var _traverseBranch=function(xElm, sSsgPath, iLevel, _actPre){
				if(xNyf.folderExists(sSsgPath)){

					var xItem=xElm.createElement('outline');
					var sTitle=xNyf.getFolderHint(sSsgPath)||'untitled';
					xItem.addAttribute('text', sTitle);

					if(_actPre) _actPre(xElm, sSsgPath, iLevel);
					_traverseChildren(xItem, sSsgPath, iLevel+1, _actPre);
				}
			};

			var _traverseChildren=function(xElm, sSsgPath, iLevel, _actPre){
				var v=xNyf.listFolders(sSsgPath);
				for(var i in v){
					var sName=v[i];
					if(sName){
						var xSsgSub=new CLocalFile(sSsgPath); xSsgSub.append(sName); xSsgSub.append('/');
						_traverseBranch(xElm, xSsgSub, iLevel, _actPre);
					}
				}
			};

			var xActPre=function(xElm, sSsgPath, iLevel){
				return;
			};

			var xml=new CXmlDocument();
			if(xml){
				var xRoot=xml.getElementByPath('/opml', true);
				if(xRoot){
					xRoot.addAttribute('version', '2.0');
					var xHead=xRoot.createElement('head');
					if(xHead){
						xHead.createElement('title', sItemTitle);
					}
					var xBody=xRoot.createElement('body');
					if(xBody){
						_traverseBranch(xBody, sCurItem, 0, xActPre, null);
					}
				}
				var sXml=xml.serialize();
				if(sXml){
					var xDstFn=new CLocalFile(sDstFn);
					if(xDstFn.saveUtf8(sXml)>0){
						var sMsg=_lc2('Done', 'Successfully generated the OPML document.');
						alert(sMsg+'\n\n'+xDstFn);
					}
				}
			}
		}
	}else{
		alert(_lc('Prompt.Warn.NoDbOpened', 'No database is currently opened.'));
	}

}catch(e){
	alert(e);
}
