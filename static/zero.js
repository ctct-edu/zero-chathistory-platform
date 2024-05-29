$(document).ready(function(){

    let count = 0; 

    // 画像生成処理
    $("#createImg").click(function(){

        if (! ($('form')[0].reportValidity() || $('form')[1].reportValidity()) ){
            return false;
        }


        // Loading用画像追加
        $("#dispImg").append(
            "<img src='/static/loading.png'"
             + " class='imgStyle loadAnime'"
             + " id='img" + count + "'"
            + ">"
        );

        // API実行
        $.ajax({
            url: "https://zero-platform.openai.azure.com/openai/deployments/Dalle3/images/generations?api-version=2024-04-01-preview",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            headers: {
                "api-key": $("#apikey").val()
            },
            // リクエストデータはJSON形式で送付
            data: JSON.stringify({
                "prompt": $("#prompt").val(),
                "n": 1,
                "size": "1024x1024",
                "style": "vivid",
                "quality": "standard"
            }),
            success: function(data){
                $("#img" + count).attr("src", data.data[0]["url"])
                                 .removeClass("loadAnime");
                
                console.log(data.data[0]["url"]);
                count++;
            }
            // error時は後回し
        });

        return false;
    });


});