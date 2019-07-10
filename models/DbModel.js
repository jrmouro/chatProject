var mongodb = require('mongodb');

class DbModel {

    constructor(dbClient, dbName, dbCollectionName, isSafety) {
        this.isSafety = isSafety || false;
        this.dbName = dbName;
        this.dbCollectionName = dbCollectionName;
        this.db = dbClient.db(dbName);
        this.dbCollection = this.db.collection(dbCollectionName);
    }

    static getObjectID(id){
        return new mongodb.ObjectID(id);
    }

    attachDataSafety(data){
		data['_safety_'] = undefined;
    }
    
    joinQuerySafety(query, safety){
		query = { $and: [ query, safety ] };
	}

    insertOne(data, callback){
        if(this.isSafety)
            this.insertOneSafety(data, callback);
        else
        this.dbCollection.insertOne(data, callback);
    }

    insertOneSafety(data, callback){
        this.attachDataSafety(data);
        this.dbCollection.insertOne(data, callback);
    }

    insertMany(data, callback){
        if(this.isSafety)
            this.insertManySafety(data, callback);
        else
        this.dbCollection.insertMany(data, callback);
    }

    insertManySafety(data, callback){
        data.foreach(function(element){
            this.attachDataSafety(element);
        });
        this.dbCollection.insertMany(data, callback);
    }

    findOne(query, callback){
        if(this.isSafety)
            this.findOneSafety(query, {_safety_ : null}, callback);
        else
            this.dbCollection.findOne(query, {}, callback);
    }

    findOneProject(query, project, callback){
        if(this.isSafety)
            this.findOneProjectSafety(query, project, {_safety_ : null}, callback);
        else
        this.dbCollection.findOne(query, project, callback);
    }

    findOneSafety(query, safety, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.findOne(query, {}, callback);
    }

    findOneProjectSafety(query, project, safety, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.findOne(query, project, callback);
    }

    findMany(query, callback){
        if(this.isSafety)
            this.findManySafety(query, {_safety_ : null}, callback);
        else
            this.dbCollection.find(query,{}).toArray(callback);
    }

    findManyProject(query, project, callback){
        if(this.isSafety)
            this.findManyProjectSafety(query, project, {_safety_ : null}, callback);
        else
            this.dbCollection.find(query, project).toArray(callback);
    }

    findAggregate(query, callback){
        this.dbCollection.aggregate(query, {}, function(err, result){
            if(err) throw err;
            result.toArray(function(err, result){
                callback(err, result);
            });
        });
    }

    findManySafety(query, safety, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.find(query,{}).toArray(callback);
    }

    findManyProjectSafety(query, project, safety, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.find(query, project).toArray(callback);
    }

    findManySort(query, sort, callback){
        if(this.isSafety)
            this.findManySortSafety(query, {_safety_ : null}, callback);
        else
            this.dbCollection.find(query, sort).toArray(callback);
    }

    findManyProjectSort(query, project, sort, callback){
        if(this.isSafety)
            this.findManyProjectSortSafety(query, project, {_safety_ : null}, callback);
        else
            this.dbCollection.find(query,project).sort(sort).toArray(callback);
    }

    findManySortSafety(query, safety, sort, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.find(query,{}).sort(sort).toArray(callback);
    }

    findManyProjectSortSafety(query, project, safety, sort, callback){
        this.joinQuerySafety(query, safety);
        this.dbCollection.find(query,project).sort(sort).toArray(callback);
    }

    findAllSafety(safety, callback){
        this.dbCollection.find(safety,{}).toArray(callback);
    }

    findAllProjectSafety(project, safety, callback){
        this.dbCollection.find(safety, project).toArray(callback);
    }

    findAll(callback){
        if(this.isSafety)
            this.findAllSafety({_safety_ : null}, callback);
        else
            this.dbCollection.find({},{}).toArray(callback);
    }

    findAllProject(project, callback){
        if(this.isSafety)
            this.findAllProjectSafety(project, {_safety_ : null}, callback);
        else
            this.dbCollection.find({}, project).toArray(callback);
    }

    findAllSort(sort, callback){
        if(this.isSafety)
            this.findAllSortSafety({_safety_ : null},sort, callback);
        else
            this.dbCollection.find({},{}).sort(sort).toArray(callback);
    }

    findAllProjectSort(project, sort, callback){
        if(this.isSafety)
            this.findAllProjectSortSafety(project, {_safety_ : null},sort, callback);
        else
            this.dbCollection.find({},project).sort(sort).toArray(callback);
    }

    findAllSortSafety(safety, sort, callback){
        this.dbCollection.find(safety,{}).sort(sort).toArray(callback);
    }

    findAllProjectSortSafety(project, safety, sort, callback){
        this.dbCollection.find(safety,project).sort(sort).toArray(callback);
    }

    updateOne(query, dataUpdate, callback){
        if(this.isSafety)
            this.updateOneSafety(query, dataUpdate, callback);
        else
        this.dbCollection.updateOne(query, dataUpdate, callback);
    }

    updateOneSafety(query, dataUpdate, callback){
        this.joinQuerySafety(query, {_safety_ : null});
        this.dbCollection.updateOne(query, dataUpdate, callback);
    }

    updateMany(query, dataUpdate, callback){
        if(this.isSafety)
            this.updateManySafety(query, dataUpdate, callback);
        else
            this.dbCollection.updateMany(query, dataUpdate, callback);
    }

    updateManySafety(query, dataUpdate, callback){
        this.joinQuerySafety(query, {_safety_ : null});
        this.dbCollection.updateMany(query, dataUpdate, callback);
    }

    deleteOne(query, callback){
        if(this.isSafety)
            this.deleteOneSafety(query, callback);
        else
            this.dbCollection.deleteOne(query, callback);
    }

    deleteOneSafety(query, callback){
        this.updateOneSafety(query, 
                            {_safety_:  null}, 
                            {$set:{_safety_:  Date()}}, 
                            callback);   
    }

    deleteMany(query, callback){
        if(this.isSafety)
            this.deleteManySafety(query, callback);
        else
            this.dbCollection.deleteMany(query, callback);
    }

    deleteManySafety(query, callback){
        this.updateManySafety(query, 
            {_safety_:  null}, 
            {$set:{_safety_:  Date()}},
            callback);
    }
}

module.exports = DbModel;
