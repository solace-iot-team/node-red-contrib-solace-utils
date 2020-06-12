/**
 * Solace utilities for Node-RED: ForEach
 * Copyright Solace Corporation and other contributors <https://solace.com/>
 * Released under Apache 2.0 license
 */

module.exports = function(RED) {

  function ForEach(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      this.properties = {
        name: config.name,
        action: "",
        input: {},
        run: {}
      }

      node.on('input', function(msg, send, done) {

        this.properties.input = {
          msg: msg,
          send: send,
          done: done
        };

        try {

          // action: start, re-start, next, end?
          let forEach = RED.util.getMessageProperty(msg, 'forEach');
          if(forEach !== undefined) {
            // start or re-start
            // check if all params exist
            if(forEach.start === undefined) throw "ForEach.on.input():msg.forEach.start not found.";
            if(forEach.end === undefined) throw "ForEach.on.input():msg.forEach.end not found.";
            if(forEach.items === undefined) throw "ForEach.on.input():msg.forEach.items not found.";
            if(!Array.isArray(forEach.items)) throw "ForEach.on.input():msg.forEach.items is not an array.";
            if(forEach.items.length === 0) throw "ForEach.on.input():msg.forEach.items.length is 0.";

            //re-start?
            if(Object.entries(this.properties.run).length > 0) this.properties.action = "re-start";
            else this.properties.action = "start";
          } else {
            if(Object.entries(this.properties.run).length === 0) throw "ForEach.on.input():msg.forEach not found and node not initialized.";
            // next or end?
            if(this.properties.run.items.length===0) this.properties.action = "end";
            else this.properties.action = "next";
          }

          switch(this.properties.action) {
            case "start": {
              this.start();
            }
            break;
            case "re-start": {
              this.cleanRun();
              this.start();
            }
            break;
            case "next": {
              this.next();
            }
            break;
            case "end": {
              this.end();
            }
            break;
            default: {
              throw `ForEach.on.input():unknown action:'${this.properties.action}'`;
            }
          }

        } catch(err) {
          this.handleErr(err);
        }
      });

      node.on('close', function(removed, done) {
        node.status({});
        done();
      });
  }

  ForEach.prototype.cleanRun = function() {
    this.properties.run.start = undefined;
    this.properties.run.end = undefined;
    this.properties.run.items = undefined;
    this.properties.run = {};
  }
  ForEach.prototype.cleanUp = function() {
    this.cleanRun();
    this.properties.input.msg = undefined;
  }

  ForEach.prototype.handleErr = function(err) {

    this.status( { fill: "red", shape: "dot", text: `error:${err.toString()}` });

    this.properties.input.done(`action:${this.properties.action}:${err}`);

    this.cleanUp();

  }

/*
  ForEach.prototype.handleResult = function(result) {
    var node = this;

    try {

      if(this.properties.isDone) return;

      switch(result) {
        case 'true':
          node.status( { fill: "green", shape: "dot", text: "success" });
          node.send([this.properties.input.msg, null]);
          break;
        default: {
          throw new Error(`unknown result: ${this.properties.method}: ${result}`)
        }
      }

      this.properties.input.done();

    } catch(err) {
      this.handleErr(err);
    }
  }
*/

  ForEach.prototype.start = function() {

    try {

      //console.log("ForEach.start(): this.properties.input = \n" + JSON.stringify(this.properties.input, null, 1));

      this.properties.run.start = JSON.parse(JSON.stringify(this.properties.input.msg.forEach.start));
      this.properties.run.end = JSON.parse(JSON.stringify(this.properties.input.msg.forEach.end));
      this.properties.run.items = JSON.parse(JSON.stringify(this.properties.input.msg.forEach.items));
      this.properties.run.i = 0;
      this.properties.run.numItems = this.properties.run.items.length;

      let msg = this.properties.input.msg;
      msg.payload = {
          start: this.properties.run.start,
          numItems: this.properties.run.numItems
      };
      msg.forEach = undefined;

      this.status({fill:"green",shape:"dot",text:"start"});
      this.properties.input.send([msg, null, null]);
      this.properties.input.done();

    } catch(e) {
      throw "ForEach.start():" + e;
    }
  }

  ForEach.prototype.next = function() {

    try {

      let msg = this.properties.input.msg;
      msg.payload = {
        item: {
          i: this.properties.run.i,
          v: this.properties.run.items.shift(),
          l: this.properties.run.numItems
        }
      }
      this.properties.run.i++;

      this.status({fill:"green",shape:"dot",text:`item:${this.properties.run.i}(${this.properties.run.numItems})`});
      this.properties.input.send([null, msg, null]);
      this.properties.input.done();

    } catch(e) {
      throw "ForEach.next():" + e;
    }
  }

  ForEach.prototype.end = function() {

    try {

      let msg = this.properties.input.msg;
      msg.payload = {
        end: JSON.parse(JSON.stringify(this.properties.run.end)),
        numItems: this.properties.run.numItems
      }

      // clean up properties
      this.cleanUp();

      this.status({fill:"green",shape:"dot",text:"end"});
      this.properties.input.send([null, null, msg]);
      this.properties.input.done();

    } catch(e) {
      throw "ForEach.end():" + e;
    }
  }

  RED.nodes.registerType("ForEach", ForEach);
}
