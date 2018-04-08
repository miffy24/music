{
    let view =  {
        el:'.page>main',
        init(){
            this.$el=$(this.el)
        },
        template:`
            <form class="form">
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
            let placeholders =['name','singer','url','id']
            let html = this.template
            placeholders.map((string)=>{
                html=html.replace(`__${string}__`,data[string]||'')
            })
            $(this.el).html(html)
            if(data.id){
                $(this.el).prepend('<h2>编辑歌曲</h2>')
            }else{
                $(this.el).prepend('<h2>新建歌曲</h2>')
            }
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
        update(data){
            var song = AV.Object.createWithoutData('Song', this.data.id)
            song.set('name', data.name)
            song.set('singer',data.singer)
            song.set('url',data.url)
            return song.save().then((response)=>{
                Object.assign(this.data,data)
                return response
            })
        }
    }
    let controller={
        init(view,model){
            this.view =view
            this.model = model
            this.view.render(this.model.data)
            this.view.init()
            this.bindEvents()
            this.bindEventHubs()
        },
        create(){
            let needs = ' name singer url'.split(' ')
            let data ={}
            needs.map((string)=>{
                 data[string] = this.view.$el.find(`[name="${string}"]`).val() 
            })
            this.model.create(data)
                .then(()=>{
                    this.view.reset()
                    window.eventHub.emit('create',JSON.parse(JSON.stringify(this.model.data)))
                })
        },
        update(){
            let needs = ' name singer url'.split(' ')
            let data ={}
            needs.map((string)=>{
                 data[string] = this.view.$el.find(`[name="${string}"]`).val() 
            })
            this.model.update(data)
                .then(()=>{
                    window.eventHub.emit('update',JSON.parse(JSON.stringify(this.model.data)))
                })
        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault()
                if(this.model.data.id){
                    this.update()
                }else{
                    this.create()
                }
            })
        },
        bindEventHubs(){
            window.eventHub.on('new',(data)=>{
                if(this.model.data.id){
                    this.model.data = {}
                }else{
                    Objec.assign(this.model.data,data)
                }
                this.view.render(this.model.data)
            })
            window.eventHub.on('select',(data)=>{
                this.model.data = data
                this.view.render(this.model.data)                
            })
            window.eventHub.on('new',(data)=>{
                this.model.data ={}
                this.view.render(this.model.data )
            })
        }        
    }
    controller.init(view,model)
}