const {
    ModelCollection,
    Model
} = require('@viewjs/models'), {
    withRestCollection,
    withRestModel
} = require('./lib');


const Todo = withRestModel(Model),
    Todos = withRestCollection(ModelCollection, 'http://localhost:3000/');


const todos = new Todos(void 0, {
    Model: Todo
});

async function run() {


    // let count = 10;
    // while (count--) {
    //     await todos.create({
    //         name: 'Todo ' + (10 - count)
    //     });
    // }
    // await todos.create({
    //     name: 'Todo 1'
    // })

    await todos.fetch();
    console.log(todos.sort('name').toJSON());
    //await todos.item(0).delete();
    // console.log(todos);

    //const todo = todos.item(0).set('id', 'raprap')
    await todos.fetch({
        method: 'reset'
    });

    console.log(todos.toJSON());
    // await todo.set({
    //     name: 'Aaa 2220 Rasmus',
    //     desc: 'test'
    // }).save()
}



run().catch(e => console.error(e));



// todos.save().catch(e => console.error(e))