xjsfl.init(this);

var dialog=new XUL("Choose json file");
dialog.addTextbox("JSON path","path");
dialog.addButton("Browse...","browse");
dialog.addEvent("browse","click",onBrowse);
dialog.show();

function onBrowse(event)
{
    var jsonURI=fl.browseForFileURL("open","Choose json file");
    this.controls.path.value=URI.toPath(jsonURI);
    var json=new File(jsonURI).contents;
    var movieClips=JSON.decode(json);
    for (var curMovieClipName in movieClips)
    {
        $dom.library.addNewItem("movie clip","symbols/"+curMovieClipName);
        var curMovieClip=movieClips[curMovieClipName];
        $dom.library.editItem("symbols/"+curMovieClipName);
        for (var i=0;i<curMovieClip.length;i++)
        {
            var curElement=curMovieClip[i];
            var kind=curElement.kind;
            switch(kind)
            {
                case "quad":
                    // can't implement
                    // missing information for the type of the shape
                    break;
                case "image":
                    $dom.library.addItemToDocument({x:0,y:0},"png/"+curElement.name);
                    var image=$("/png/"+curElement.name).get(0);
                    image.scaleX=curElement.scaleX;
                    image.scaleY=curElement.scaleY;
                    image.x=curElement.x;
                    image.y=curElement.y;
                    image.skewX=curElement.skewX;
                    image.skewY=curElement.skewY;
                    image.rotation=curElement.rotation;
                    break;
                case "text":

                    break;
                case "sprite":

                    break;
            }
        }
        trace();

    }
}
 