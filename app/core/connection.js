/**
 * Modifications by Sharon Zhou for Ingenium, noted by comments with ***, eg. //***
 */

 /**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Connection');
goog.provide('Blockly.ConnectionDB');


/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 */
Blockly.Connection = function(source, type) {
  this.sourceBlock_ = source;
  this.targetConnection = null;
  this.type = type;
  this.x_ = 0;
  this.y_ = 0;
  this.inDB_ = false;
  // Shortcut for the databases for this connection's workspace.
  this.dbList_ = this.sourceBlock_.workspace.connectionDBList;
};

/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function() {
  if (this.targetConnection) {
    throw 'Disconnect connection before disposing of it.';
  }
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.inDB_ = false;
  if (Blockly.highlightedConnection_ == this) {
    Blockly.highlightedConnection_ = null;
  }
  if (Blockly.localConnection_ == this) {
    Blockly.localConnection_ = null;
  }
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Blockly.Connection.prototype.isSuperior = function() {
  // return this.type == Blockly.INPUT_VALUE ||
  //     this.type == Blockly.NEXT_STATEMENT;
  //***
  return this.type == Blockly.INPUT_VALUE ||
      this.type == Blockly.NEXT_STATEMENT || 
      this.type == Blockly.NOMINATIVE_INPUT_VALUE ||
      this.type == Blockly.GENITIVE_INPUT_VALUE ||
      this.type == Blockly.DATIVE_INPUT_VALUE ||
      this.type == Blockly.ACCUSATIVE_INPUT_VALUE ||
      this.type == Blockly.ABLATIVE_INPUT_VALUE ||
      this.type == Blockly.VOCATIVE_INPUT_VALUE;
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function(otherConnection) {
  if (this.sourceBlock_ == otherConnection.sourceBlock_) {
    throw 'Attempted to connect a block to itself.';
  }
  if (this.sourceBlock_.workspace !== otherConnection.sourceBlock_.workspace) {
    throw 'Blocks are on different workspaces.';
  }
  if (Blockly.OPPOSITE_TYPE[this.type] != otherConnection.type) {
    throw 'Attempt to connect incompatible types.';
  }
  // if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
  //***
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE || 
      this.type == Blockly.NOMINATIVE_INPUT_VALUE || this.type == Blockly.NOMINATIVE_OUTPUT_VALUE ||
      this.type == Blockly.GENITIVE_INPUT_VALUE || this.type == Blockly.GENITIVE_OUTPUT_VALUE ||
      this.type == Blockly.DATIVE_INPUT_VALUE || this.type == Blockly.DATIVE_OUTPUT_VALUE ||
      this.type == Blockly.ACCUSATIVE_INPUT_VALUE || this.type == Blockly.ACCUSATIVE_OUTPUT_VALUE ||
      this.type == Blockly.ABLATIVE_INPUT_VALUE || this.type == Blockly.ABLATIVE_OUTPUT_VALUE ||
      this.type == Blockly.VOCATIVE_INPUT_VALUE || this.type == Blockly.VOCATIVE_OUTPUT_VALUE) {
    if (this.targetConnection) {
      // Can't make a value connection if male block is already connected.
      throw 'Source connection already connected (value).';
    } else if (otherConnection.targetConnection) {
      // If female block is already connected, disconnect and bump the male.
      var orphanBlock = otherConnection.targetBlock();
      orphanBlock.setParent(null);
      if (!orphanBlock.outputConnection) {
        throw 'Orphan block does not have an output connection.';
      }
      // Attempt to reattach the orphan at the end of the newly inserted
      // block.  Since this block may be a row, walk down to the end.
      var newBlock = this.sourceBlock_;
      var connection;
      while (connection = Blockly.Connection.singleConnection_(
          /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) {
        // '=' is intentional in line above.
        if (connection.targetBlock()) {
          newBlock = connection.targetBlock();
        } else {
          connection.connect(orphanBlock.outputConnection);
          orphanBlock = null;
          break;
        }
      }
      if (orphanBlock) {
        // Unable to reattach orphan.  Bump it off to the side.
        setTimeout(function() {
              orphanBlock.outputConnection.bumpAwayFrom_(otherConnection);
            }, Blockly.BUMP_DELAY);
      }
    }
  } else {
    if (this.targetConnection) {
      throw 'Source connection already connected (block).';
    } else if (otherConnection.targetConnection) {
      // Statement blocks may be inserted into the middle of a stack.
      if (this.type != Blockly.PREVIOUS_STATEMENT) {
        throw 'Can only do a mid-stack connection with the top of a block.';
      }
      // Split the stack.
      var orphanBlock = otherConnection.targetBlock();
      orphanBlock.setParent(null);
      if (!orphanBlock.previousConnection) {
        throw 'Orphan block does not have a previous connection.';
      }
      // Attempt to reattach the orphan at the bottom of the newly inserted
      // block.  Since this block may be a stack, walk down to the end.
      var newBlock = this.sourceBlock_;
      while (newBlock.nextConnection) {
        if (newBlock.nextConnection.targetConnection) {
          newBlock = newBlock.getNextBlock();
        } else {
          if (orphanBlock.previousConnection.checkType_(
              newBlock.nextConnection)) {
            newBlock.nextConnection.connect(orphanBlock.previousConnection);
            orphanBlock = null;
          }
          break;
        }
      }
      if (orphanBlock) {
        // Unable to reattach orphan.  Bump it off to the side.
        setTimeout(function() {
              orphanBlock.previousConnection.bumpAwayFrom_(otherConnection);
            }, Blockly.BUMP_DELAY);
      }
    }
  }

  // Determine which block is superior (higher in the source stack).
  var parentBlock, childBlock;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = otherConnection.sourceBlock_;
    childBlock = this.sourceBlock_;
  }

  // Establish the connections.
  this.targetConnection = otherConnection;
  otherConnection.targetConnection = this;

  // Demote the inferior block so that one is a child of the superior one.
  childBlock.setParent(parentBlock);

  if (parentBlock.rendered) {
    parentBlock.updateDisabled();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
  }
  if (parentBlock.rendered && childBlock.rendered) {
    if (this.type == Blockly.NEXT_STATEMENT ||
        this.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }
};

/**
 * Does the given block have one and only one connection point that will accept
 * the orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 */
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
  var connection = false;
  for (var x = 0; x < block.inputList.length; x++) {
    var thisConnection = block.inputList[x].connection;
    // if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
    //     orphanBlock.outputConnection.checkType_(thisConnection)) {
    //***
    if (thisConnection && thisConnection.type == (Blockly.INPUT_VALUE || Blockly.NOMINATIVE_INPUT_VALUE || 
      Blockly.GENITIVE_INPUT_VALUE || Blockly.DATIVE_INPUT_VALUE || Blockly.ACCUSATIVE_INPUT_VALUE || 
      Blockly.ABLATIVE_INPUT_VALUE || Blockly.VOCATIVE_INPUT_VALUE) &&
        orphanBlock.outputConnection.checkType_(thisConnection)) {
      if (connection) {
        return null;  // More than one connection.
      }
      connection = thisConnection;
    }
  }
  return connection;
};

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if (!otherConnection) {
    throw 'Source connection not connected.';
  } else if (otherConnection.targetConnection != this) {
    throw 'Target connection not connected to source connection.';
  }
  otherConnection.targetConnection = null;
  this.targetConnection = null;

  // Rerender the parent so that it may reflow.
  var parentBlock, childBlock;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = otherConnection.sourceBlock_;
    childBlock = this.sourceBlock_;
  }
  if (parentBlock.rendered) {
    parentBlock.render();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
    childBlock.render();
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function() {
  if (this.targetConnection) {
    return this.targetConnection.sourceBlock_;
  }
  return null;
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.Connection.prototype.bumpAwayFrom_ = function(staticConnection) {
  console.log('bumping');
  if (Blockly.dragMode_ != 0) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.sourceBlock_.getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (Blockly.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.Connection.prototype.moveTo = function(x, y) {
  // Remove it from its old location in the database (if already present)
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.x_ = x;
  this.y_ = y;
  // Insert it into its new location in the database.
  this.dbList_[this.type].addConnection_(this);
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.Connection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Add highlighting around this connection. (shown when hovering over correct connection)
 */
Blockly.Connection.prototype.highlight = function() {
  var steps;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
                                 Blockly.BlockSvg.TAB_WIDTH;
    steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
            tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
  } else if (this.type == Blockly.NOMINATIVE_INPUT_VALUE || this.type == Blockly.NOMINATIVE_OUTPUT_VALUE) {
    // Highlighting for shape without stem in inline pieces when hovering over
    var tabWidth = Blockly.BlockSvg.TAB_WIDTH;
    steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
            tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
  } else if (this.type == Blockly.GENITIVE_INPUT_VALUE || this.type == Blockly.GENITIVE_OUTPUT_VALUE) {
    // Cross
    steps = 'm 0,0 v 7 h -3 v 3.25 h -4 v 3.5 h 4 v 3.25 h 3 v 7';
  } else if (this.type == Blockly.DATIVE_INPUT_VALUE || this.type == Blockly.DATIVE_OUTPUT_VALUE) {
    // Rectangular
    steps = 'm 0,0 v 7 h -7 v 10 h 7 v 7';
  } else if (this.type == Blockly.ACCUSATIVE_INPUT_VALUE || this.type == Blockly.ACCUSATIVE_OUTPUT_VALUE) {
    // Circular
    steps = 'm -2,0 v 8 a 5,5 0 1 0 0,10 v 7';
  } else if (this.type == Blockly.ABLATIVE_INPUT_VALUE || this.type == Blockly.ABLATIVE_OUTPUT_VALUE) {
    // Triangular
    steps = 'm 0,0 v 7 l -7,5 7,5 v 6';
  } else if (this.type == Blockly.VOCATIVE_INPUT_VALUE || this.type == Blockly.VOCATIVE_OUTPUT_VALUE) {
    // Funnel
    steps = 'm 0,0 v 10.5 l -7,-3 v 10 l 7,-3 v 10.5';
  } else {
    if (Blockly.RTL) {
      steps = 'm 20,0 h -5 ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -5';
    } else {
      //*** Highlighting for clamps varies by part of speech (noun vs. verb), when hovering over
      if (this.sourceBlock_.pos == "noun") {
        // Top of clamp for nouns
        steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.CIRCULAR_CLAMP_IN + ' h 5';
        // Bottom of clamp for nouns
        steps += 'm 0,' + (Blockly.BlockSvg.TAB_HEIGHT + 2) + ' h -5 ' + Blockly.BlockSvg.CIRCULAR_CLAMP_OUT + ' h -5';
      } else {
        // Top of clamp for verbs
        steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.RECTANGULAR_CLAMP_IN + ' h 5';
        // Bottom of clamp for verbs
        steps += 'm 0,' + (Blockly.BlockSvg.TAB_HEIGHT + 2) + ' h -5 ' + Blockly.BlockSvg.RECTANGULAR_CLAMP_OUT + ' h -5';
      }
      // steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT + ' h 5';
      //*** Added highlighting to bottom of clamp for nouns and verb, eg. dat (statement values)
      // steps += 'm 0,' + (Blockly.BlockSvg.TAB_HEIGHT + 2) + ' h -5 ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -5';
    }
  }

  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
      {'class': 'blocklyHighlightedConnectionPath',
       'd': steps,
       transform: 'translate(' + x + ', ' + y + ')'},
      this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.Connection.prototype.unhighlight = function() {
  goog.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.Connection.prototype.tighten_ = function() {
  var dx = Math.round(this.targetConnection.x_ - this.x_);
  var dy = Math.round(this.targetConnection.y_ - this.y_);
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if (!svgRoot) {
      throw 'block is not rendered.';
    }
    var xy = Blockly.getRelativeXY_(svgRoot);
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ', ' + (xy.y - dy) + ')');
    block.moveConnections_(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!Object} Contains two properties: 'connection' which is either
 *     another connection or null, and 'radius' which is the distance.
 */
Blockly.Connection.prototype.closest = function(maxLimit, dx, dy) {
  if (this.targetConnection) {
    // Don't offer to connect to a connection that's already connected.
    return {connection: null, radius: maxLimit};
  }
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  // Since this connection is probably being dragged, add the delta.
  var currentX = this.x_ + dx;
  var currentY = this.y_ + dy;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var closestConnection = null;
  var sourceBlock = this.sourceBlock_;
  var thisConnection = this;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the search needs to continue: either the current
   *     connection's vertical distance from the other connection is less than
   *     the allowed radius, or if the connection is not compatible.
   * @private
   */
  function checkConnection_(yIndex) {
    var connection = db[yIndex];
    // if (connection.type == Blockly.OUTPUT_VALUE ||
    //     connection.type == Blockly.PREVIOUS_STATEMENT) {
    //***
    if (connection.type == Blockly.OUTPUT_VALUE ||
        connection.type == Blockly.PREVIOUS_STATEMENT ||
        connection.type == Blockly.NOMINATIVE_OUTPUT_VALUE ||
        connection.type == Blockly.GENITIVE_OUTPUT_VALUE || 
        connection.type == Blockly.DATIVE_OUTPUT_VALUE || 
        connection.type == Blockly.ACCUSATIVE_OUTPUT_VALUE ||
        connection.type == Blockly.ABLATIVE_OUTPUT_VALUE ||
        connection.type == Blockly.VOCATIVE_OUTPUT_VALUE) {      
      // Don't offer to connect an already connected left (male) value plug to
      // an available right (female) value plug.  Don't offer to connect the
      // bottom of a statement block to one that's already connected.
      if (connection.targetConnection) {
        return true;
      }
    }
    // Offering to connect the top of a statement block to an already connected
    // connection is ok, we'll just insert it into the stack.

    // Offering to connect the left (male) of a value block to an already
    // connected value pair is ok, we'll splice it in.
    // However, don't offer to splice into an unmovable block.
    // if (connection.type == Blockly.INPUT_VALUE &&
    //***
    if ((connection.type == Blockly.INPUT_VALUE || connection.type == Blockly.NOMINATIVE_INPUT_VALUE || 
      connection.type == Blockly.GENITIVE_INPUT_VALUE || connection.type == Blockly.DATIVE_INPUT_VALUE ||
      connection.type == Blockly.ACCUSATIVE_INPUT_VALUE || connection.type == Blockly.ABLATIVE_INPUT_VALUE ||
      connection.type == Blockly.VOCATIVE_INPUT_VALUE) &&
        connection.targetConnection &&
        !connection.targetBlock().isMovable()) {
      return true;
    }

    // Do type checking.
    if (!thisConnection.checkType_(connection)) {
      return true;
    }

    // Don't let blocks try to connect to themselves or ones they nest.
    var targetSourceBlock = connection.sourceBlock_;
    do {
      if (sourceBlock == targetSourceBlock) {
        return true;
      }
      targetSourceBlock = targetSourceBlock.getParent();
    } while (targetSourceBlock);

    // Only connections within the maxLimit radius.
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxLimit) {
      closestConnection = db[yIndex];
      maxLimit = r;
    }
    return dy < maxLimit;
  }
  return {connection: closestConnection, radius: maxLimit};
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
Blockly.Connection.prototype.checkType_ = function(otherConnection) {
  if (!this.check_ || !otherConnection.check_) {
    // One or both sides are promiscuous enough that anything will fit.
    return true;
  }
  // Find any intersection in the check lists.
  for (var x = 0; x < this.check_.length; x++) {
    if (otherConnection.check_.indexOf(this.check_[x]) != -1) {
      return true;
    }
  }
  // No intersection.
  return false;
};

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check) {
    // Ensure that check is in an array.
    if (!goog.isArray(check)) {
      check = [check];
    }
    this.check_ = check;
    // The new value type may not be compatible with the existing connection.
    if (this.targetConnection && !this.checkType_(this.targetConnection)) {
      if (this.isSuperior()) {
        this.targetBlock().setParent(null);
      } else {
        this.sourceBlock_.setParent(null);
      }
      // Bump away.
      this.sourceBlock_.bumpNeighbours_();
    }
  } else {
    this.check_ = null;
  }
  return this;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.Connection.prototype.neighbours_ = function(maxLimit) {
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  var currentX = this.x_;
  var currentY = this.y_;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var neighbours = [];
  var sourceBlock = this.sourceBlock_;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the current connection's vertical distance from
   *     the other connection is less than the allowed radius.
   */
  function checkConnection_(yIndex) {
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxLimit) {
      neighbours.push(db[yIndex]);
    }
    return dy < maxLimit;
  }
  return neighbours;
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.Connection.prototype.hideAll = function() {
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  if (this.targetConnection) {
    var blocks = this.targetBlock().getDescendants();
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      // Hide all connections of all children.
      var connections = block.getConnections_(true);
      for (var c = 0; c < connections.length; c++) {
        var connection = connections[c];
        if (connection.inDB_) {
          this.dbList_[connection.type].removeConnection_(connection);
        }
      }
      // Close all bubbles of all children.
      var icons = block.getIcons();
      for (var x = 0; x < icons.length; x++) {
        icons[x].setVisible(false);
      }
    }
  }
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Connection.prototype.unhideAll = function() {
  if (!this.inDB_) {
    this.dbList_[this.type].addConnection_(this);
  }
  // All blocks that need unhiding must be unhidden before any rendering takes
  // place, since rendering requires knowing the dimensions of lower blocks.
  // Also, since rendering a block renders all its parents, we only need to
  // render the leaf nodes.
  var renderList = [];
  // if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
  // ***
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT && this.type != Blockly.NOMINATIVE_INPUT_VALUE
    && this.type != Blockly.GENITIVE_INPUT_VALUE && this.type != Blockly.DATIVE_INPUT_VALUE && 
    this.type != Blockly.ACCUSATIVE_INPUT_VALUE && this.type != Blockly.ABLATIVE_INPUT_VALUE && 
    this.type != Blockly.VOCATIVE_INPUT_VALUE) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.isCollapsed()) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var c = 0; c < connections.length; c++) {
      renderList.push.apply(renderList, connections[c].unhideAll());
    }
    if (renderList.length == 0) {
      // Leaf block.
      renderList[0] = block;
    }
  }
  return renderList;
};


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function() {
};

Blockly.ConnectionDB.prototype = new Array();
/**
 * Don't inherit the constructor from Array.
 * @type {!Function}
 */
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 * @private
 */
Blockly.ConnectionDB.prototype.addConnection_ = function(connection) {
  if (connection.inDB_) {
    throw 'Connection already in database.';
  }
  // Insert connection using binary search.
  var pointerMin = 0;
  var pointerMax = this.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this[pointerMid].y_ > connection.y_) {
      pointerMax = pointerMid;
    } else {
      pointerMin = pointerMid;
      break;
    }
  }
  this.splice(pointerMin, 0, connection);
  connection.inDB_ = true;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if (!connection.inDB_) {
    throw 'Connection not in database.';
  }
  connection.inDB_ = false;
  // Find the connection using a binary search.
  var pointerMin = 0;
  var pointerMax = this.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the connection.
  // When found, splice it out of the array.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  while (pointerMin >= 0 && this[pointerMin].y_ == connection.y_) {
    if (this[pointerMin] == connection) {
      this.splice(pointerMin, 1);
      return;
    }
    pointerMin--;
  }
  do {
    if (this[pointerMax] == connection) {
      this.splice(pointerMax, 1);
      return;
    }
    pointerMax++;
  } while (pointerMax < this.length &&
           this[pointerMax].y_ == connection.y_);
  throw 'Unable to find connection in connectionDB.';
};

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Blockly.Workspace} workspace The workspace this DB is for.
 */
Blockly.ConnectionDB.init = function(workspace) {
  // Create four databases, one for each connection type.
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
  //***
  dbList[Blockly.NOMINATIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NOMINATIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.GENITIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.GENITIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.DATIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.DATIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.ACCUSATIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.ACCUSATIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.ABLATIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.ABLATIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.VOCATIVE_INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.VOCATIVE_OUTPUT_VALUE] = new Blockly.ConnectionDB();
  workspace.connectionDBList = dbList;
};
