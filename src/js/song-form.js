{
    let view =  {
        el:'.page>main',
        init(){
            this.$el=$(this.el)
        },
        template:`
            <form class="form">
                <h2>新建歌曲</h2>
                <div class="row">
                    <label >歌名</label>
                    <input name="name" type="text" value="__name__">
                    
                </div>
                <div class="row">
                    <label >歌手</label>
                        <input name="singer" type="text" value="__singer__">
                    
                </div>
                <div class="row">
                    <label >外链</label>
                        <input name="url" type="text" value="__url__">
                    
                </div>
                <div class="row actions">
                        <button  type="submit" >save</button>
                </div>
            </form>       
        
        `,
        render(data={}){
            let placeholders =['name','singer','url']
            let html = this.template
            placeholders.map((string)=>{
                html=html.replace(`__${string}__`,data[string]||'')
            })
            $(this.el).html(html)
        },
        reset(){
            this.render({})
        }
    } 
    let model={
        data:{
            id:'',url:'',name:'',singer:''
        },
        create(data){
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set('name',data.name)
            song.set('url',data.url)
            song.set('singer',data.singer)
            return song.save().then((newSong) =>{
                let {id,attributes} = newSong
                Object.assign(this.data,{id,...attributes})
            }, (error) =>{
            console.error(error);
            });            
        },

    }
    let controller={
        init(view,model){
            this.view =view
            this.model = model
            this.view.render(this.model.data)
            this.view.init()
            this.bindEvents()
            window.eventHub.on('upload',(data)=>{
                this.model.data = data
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault()
                let needs = ' name singer url'.split(' ')
                let data =[]
                needs.map((string)=>{
                     data[string] = this.view.$el.find(`[name="${string}"]`).val() 
                })
                this.model.create(data)
                    .then(()=>{
                        this.view.reset()
                        let string = JSON.stringify(this.model.data)
                        let object = JSON.parse(string)
                        window.eventHub.emit('create',object)
                    })
            })
        }        
    }
    controller.init(view,model)
}