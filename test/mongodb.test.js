//for pass the jshint
/*jslint expr:true, mocha:true */
'use strict';
const expect = require('chai').expect;
const request = require('request');
const fs = require('fs');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = process.env.DB_URI || 'mongodb://localhost:27017/dev';
const connected = new Promise((resolve, reject)=>{
  MongoClient.connect(url, function(err, db){
    if(err) reject(err);
    else resolve(db);
  });
});

function find(db, collectionName, query) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).find(query).toArray(function(err, docs) {
      if(err) reject(err);
      else resolve(docs);
    });
  });
}

function insert(db, collectionName, datas) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).insertMany(datas, function(err, res) {
      if(err) reject(err);
      else resolve(res);
    });
  });
}

function update(db, collectionName, filter, update) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).updateMany(filter, update, function(err, res) {
      if(err) reject(err);
      else resolve(res);
    });
  });
}

function deleteMany(db, collectionName, filter) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).deleteMany(filter, function(err, result) {
      if(err) reject(err);
      else resolve(result);
    });
  });
}

describe("db ops", function(){
  let user1 = {email:"test@test.com",name:"name",phone:"0123456789"};
  let user2 = {email:"test2@test.com",name:"name2",phone:"0123456789"};
  const collection = "_User";
  it('insert', function(done){
    connected.then(db=>insert(db, collection, [user1, user2]))
    .then(()=>done())
    .catch(err=>{
      if(err) done(err);
      else done(new Error("something wrong"));
    });
  });

  it('find', function(done){
    connected.then(db=> {
      return find(db, collection, {email:user1.email})
      .then(users=>{
        expect(users.length).to.equal(1);
        expect(users[0].name).to.equal(user1.name);
        return find(db, collection, {email:"notexist@test.com"});
      })
      .then(users=>{
        expect(users.length).to.equal(0);
        done();
      }).catch(err=>{
        if(err) done(err);
        else done(new Error("something wrong"));
      });
    });
  });

  it('update', function(done){
    connected.then(db=> {
      update(db, collection, {name: user2.name}, {$set: {phone: '987654321'}})
      .then(r=>{
        expect(r.result.nModified).to.equal(1);
        return find(db, collection, {name: user2.name});
      })
      .then(users=>{
        expect(users.length).to.equal(1);
        expect(users[0].phone).to.equal('987654321');
        done();
      }).catch(err=>{
        if(err) done(err);
        else done(new Error("something wrong"));
      });
    });
  });
  it('delete', function(done){
    connected.then(db=>{
      deleteMany(db, collection, {email:user1.email})
      .then(result=>{
        expect(result.deletedCount).to.equal(1);
        return deleteMany(db, collection, {email:user2.email});
      })
      .then(result=>{
        expect(result.deletedCount).to.equal(1);
        return deleteMany(db, collection, {email:"notexist@test.com"});
      })
      .then(result=>{
        expect(result.deletedCount).to.equal(0);
        done();
      }).catch(err=>{
        if(err) done(err);
        else done(new Error("something wrong"));
      });
    });
  });

});
