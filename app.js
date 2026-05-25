/**
 * Node class representing an element in the Doubly Linked List.
 */
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    // visualId is used to maintain stable DOM nodes during visual transitions
    this.visualId = `node_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * LRUCache class instrumented with Generator functions to allow
 * step-by-step UI visualization of all cache operations.
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.head = new Node(0, 0); // sentinel head
    this.tail = new Node(0, 0); // sentinel tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.hm = new Map();
  }

  /**
   * Generator version of 'get' operation.
   * Yields step details for visual updates.
   * @param {number} key 
   */
  *get(key) {
    yield {
      line: 1,
      description: `Checking if key '${key}' exists in the HashMap.`,
      action: 'check_map',
      params: { key }
    };

    if (this.hm.has(key)) {
      yield {
        line: 2,
        description: `HashMap hit! Found node for key '${key}'. Fetching node.`,
        action: 'hit',
        params: { key }
      };
      
      const node = this.hm.get(key);

      yield {
        line: 3,
        description: `Moving node '${key}' to head. First, removing it from its current position.`,
        action: 'remove_call',
        params: { key, node }
      };
      
      yield* this.remove(node);

      yield {
        line: 4,
        description: `Now, inserting node '${key}' at the head of the list.`,
        action: 'insert_call',
        params: { key, node }
      };
      
      yield* this.insert(node);

      yield {
        line: 5,
        description: `Get successful! Returning key '${key}' value: ${node.value}.`,
        action: 'completed_success',
        params: { key, value: node.value }
      };
      return node.value;
    } else {
      yield {
        line: 7,
        description: `HashMap miss! Key '${key}' not found in cache. Returning -1.`,
        action: 'completed_miss',
        params: { key, value: -1 }
      };
      return -1;
    }
  }

  /**
   * Generator version of 'put' operation.
   * Yields step details for visual updates.
   * @param {number} key 
   * @param {number} value 
   */
  *put(key, value) {
    yield {
      line: 11,
      description: `Checking if key '${key}' already exists in the cache for update.`,
      action: 'check_map_put',
      params: { key, value }
    };

    if (this.hm.has(key)) {
      yield {
        line: 12,
        description: `Key '${key}' already exists. Removing the old node to perform update.`,
        action: 'remove_existing',
        params: { key }
      };
      const oldNode = this.hm.get(key);
      yield* this.remove(oldNode);
    }

    yield {
      line: 14,
      description: `Checking if cache size (${this.hm.size}) has reached capacity (${this.capacity}).`,
      action: 'check_capacity',
      params: { size: this.hm.size, capacity: this.capacity }
    };

    if (this.hm.size === this.capacity) {
      const lruNode = this.tail.prev;
      yield {
        line: 15,
        description: `Cache is full! Evicting the Least Recently Used (LRU) node with key '${lruNode.key}'.`,
        action: 'evict_lru',
        params: { key: lruNode.key, node: lruNode }
      };
      yield* this.remove(lruNode);
    }

    const newNode = new Node(key, value);
    yield {
      line: 17,
      description: `Creating new node (${key}: ${value}) and inserting it at the head.`,
      action: 'insert_new',
      params: { key, value, node: newNode }
    };
    yield* this.insert(newNode);

    yield {
      line: 18,
      description: `Put operation completed for (${key}: ${value}).`,
      action: 'completed_put',
      params: { key, value }
    };
  }

  /**
   * Helper generator to remove a node.
   * @param {Node} node 
   */
  *remove(node) {
    yield {
      line: 27,
      description: `[remove] Deleting key '${node.key}' from the HashMap.`,
      action: 'remove_map',
      params: { key: node.key, node }
    };
    this.hm.delete(node.key);

    yield {
      line: 28,
      description: `[remove] Re-linking node.prev.next (${node.prev.key} -> next) to node.next (${node.next.key}).`,
      action: 'remove_prev_link',
      params: { node }
    };
    node.prev.next = node.next;

    yield {
      line: 29,
      description: `[remove] Re-linking node.next.prev (${node.next.key} -> prev) to node.prev (${node.prev.key}).`,
      action: 'remove_next_link',
      params: { node }
    };
    node.next.prev = node.prev;
  }

  /**
   * Helper generator to insert a node at head.
   * @param {Node} node 
   */
  *insert(node) {
    yield {
      line: 20,
      description: `[insert] Adding key '${node.key}' mapping to this node in the HashMap.`,
      action: 'insert_map',
      params: { key: node.key, node }
    };
    this.hm.set(node.key, node);

    yield {
      line: 21,
      description: `[insert] Setting node.next to current first element (head.next: key '${this.head.next.key}').`,
      action: 'insert_node_next',
      params: { node, head: this.head }
    };
    node.next = this.head.next;

    yield {
      line: 22,
      description: `[insert] Setting node.next.prev to point back to the new node.`,
      action: 'insert_next_prev',
      params: { node }
    };
    node.next.prev = node;

    yield {
      line: 23,
      description: `[insert] Setting head.next to point to the new node.`,
      action: 'insert_head_next',
      params: { node, head: this.head }
    };
    this.head.next = node;

    yield {
      line: 24,
      description: `[insert] Setting node.prev to point back to head.`,
      action: 'insert_node_prev',
      params: { node, head: this.head }
    };
    node.prev = this.head;
  }

  // Utility to read current state without generator yields
  getListArray() {
    const list = [];
    let current = this.head;
    while (current) {
      list.push(current);
      current = current.next;
    }
    return list;
  }
}

// Application State Variables
let cache = null;
let currentIterator = null;
let currentOperationType = null; // 'get', 'put', or null
let isPlaying = false;
let playTimeoutId = null;
let delay = 1200; // ms between auto-steps
let lastStepVal = null; // stores the last yielded step object
let lastOperationHighlight = null; // { key, action: 'put' | 'get' }

// Analytics
let stats = {
  hits: 0,
  misses: 0
};

// Timeline History
let timelineHistory = [];
let currentOp = null;

// UI Elements
const putKeyInput = document.getElementById('put-key');
const putValInput = document.getElementById('put-value');
const btnPut = document.getElementById('btn-put');

const getKeyInput = document.getElementById('get-key');
const btnGet = document.getElementById('btn-get');

const btnRandom = document.getElementById('btn-random');
const btnClear = document.getElementById('btn-clear');

const btnPlayPause = document.getElementById('btn-play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');
const playPauseText = document.getElementById('play-pause-text');

const btnStep = document.getElementById('btn-step');
const btnSkip = document.getElementById('btn-skip');

// Capacity Controls (taken from user inputs via modal overlay)
const capacityModal = document.getElementById('capacity-modal');
const modalCapacityInput = document.getElementById('modal-capacity-input');
const btnModalStart = document.getElementById('btn-modal-start');
const btnChangeCapacity = document.getElementById('btn-change-capacity');

const speedRange = document.getElementById('speed-range');
const speedValLabel = document.getElementById('speed-val');

const hmContainer = document.getElementById('hm-container');
const dllContainer = document.getElementById('dll-container');

const explanationBox = document.getElementById('explanation-box');
const explanationText = document.getElementById('explanation-text');

const timelineEmpty = document.getElementById('timeline-empty');
const timelineContent = document.getElementById('timeline-content');
const btnCopyTimeline = document.getElementById('btn-copy-timeline');

const tabJava = document.getElementById('tab-java');
const tabJs = document.getElementById('tab-js');
const codeJava = document.getElementById('code-java');
const codeJs = document.getElementById('code-js');

// Statistics Counters
const statHits = document.getElementById('stat-hits');
const statMisses = document.getElementById('stat-misses');
const statRatio = document.getElementById('stat-ratio');
const statSize = document.getElementById('stat-size');

// Initialize visualizer UI hooks (capacity size modal triggers actual cache allocation)
function init() {
  // Register modal actions
  btnModalStart.addEventListener('click', handleModalStart);
  btnChangeCapacity.addEventListener('click', showCapacityModal);
  
  // Modal keyboard enter trigger
  modalCapacityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleModalStart();
    }
  });

  // Main visualizer operations events
  btnPut.addEventListener('click', handlePut);
  btnGet.addEventListener('click', handleGet);
  btnRandom.addEventListener('click', handleRandom);
  btnClear.addEventListener('click', handleClear);
  
  btnPlayPause.addEventListener('click', togglePlayPause);
  btnStep.addEventListener('click', handleStepForward);
  btnSkip.addEventListener('click', handleSkipToEnd);
  btnCopyTimeline.addEventListener('click', handleCopyTimeline);
  
  speedRange.addEventListener('input', handleSpeedChange);
  
  // Tabs events
  tabJava.addEventListener('click', () => switchTab('java'));
  tabJs.addEventListener('click', () => switchTab('js'));
  
  // Smart, buttonless keyboard hooks (Enter triggers instantly without button clicks)
  putKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = putValInput.value.trim();
      if (val === '') {
        putValInput.focus(); // Shift focus to Value field if currently empty
      } else {
        handlePut();
      }
    }
  });

  putValInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePut();
    }
  });

  getKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGet();
    }
  });
}

// Switch tabs inside the code panel
function switchTab(lang) {
  const ideTitle = document.getElementById('ide-title');
  if (lang === 'java') {
    tabJava.classList.add('active');
    tabJs.classList.remove('active');
    codeJava.classList.add('active');
    codeJs.classList.remove('active');
    if (ideTitle) ideTitle.textContent = 'LRUCache.java';
  } else {
    tabJs.classList.add('active');
    tabJava.classList.remove('active');
    codeJs.classList.add('active');
    codeJava.classList.remove('active');
    if (ideTitle) ideTitle.textContent = 'lruCache.js';
  }
}

// Format timestamp
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Log actions (stubbed out since terminal logs panel was removed)
function log(msg, type = 'info') {
  // Logs completely removed
}

// Highlight executing lines of code
function highlightCodeLine(lineNum) {
  // Clear previous highlights
  document.querySelectorAll('.code-line-row').forEach(row => {
    row.classList.remove('highlighted');
  });
  
  if (lineNum !== null && lineNum !== undefined) {
    const javaRow = document.getElementById(`java-l${lineNum}`);
    const jsRow = document.getElementById(`js-l${lineNum}`);
    
    if (javaRow) {
      javaRow.classList.add('highlighted');
      // Scroll lines into view inside code pane
      javaRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (jsRow) {
      jsRow.classList.add('highlighted');
      jsRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// Update live statistics dashboard
function updateStats() {
  statHits.textContent = stats.hits;
  statMisses.textContent = stats.misses;
  
  const total = stats.hits + stats.misses;
  const ratio = total === 0 ? 0 : (stats.hits / total) * 100;
  statRatio.textContent = `${ratio.toFixed(1)}%`;
  
  statSize.textContent = `${cache.hm.size} / ${cache.capacity}`;
}

// Main Render Loop: Redraws the visual representation of HashMap and DLL
function render(stepData = null) {
  renderHashMap(stepData);
  renderDLL(stepData);
}

// Draw HashMap Visual Mappings
function renderHashMap(stepData) {
  hmContainer.innerHTML = '';
  
  if (cache.hm.size === 0) {
    hmContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem; font-style: italic;">HashMap is empty. Perform a PUT operation.</div>';
    return;
  }
  
  // Render each key-value pair in a low-level memory block look
  for (const [key, node] of cache.hm.entries()) {
    const cell = document.createElement('div');
    cell.className = 'hm-cell';
    cell.dataset.key = key;
    
    // Address label (stable hash representation based on key)
    const addr = `0x${((key * 17) & 0xFF).toString(16).toUpperCase().padStart(2, '0')}`;
    
    cell.innerHTML = `
      <span class="cell-key">${key}</span>
      <span class="cell-pointer">➔</span>
      <span class="cell-val">${addr}</span>
    `;
    
    // Apply highlights depending on current generator yields
    if (stepData) {
      const { action, params } = stepData;
      if ((action === 'check_map' || action === 'check_map_put' || action === 'hit') && params.key === key) {
        cell.classList.add('active-hm');
      }
      if (action === 'remove_map' && params.key === key) {
        cell.classList.add('highlight-remove');
      }
      if (action === 'insert_map' && params.key === key) {
        cell.classList.add('active-hm');
      }
    }
    
    hmContainer.appendChild(cell);
  }
}

// Draw Doubly Linked List with Sentinels and Active Pointers
function renderDLL(stepData) {
  dllContainer.innerHTML = '';
  
  const nodes = cache.getListArray(); // Includes head and tail sentinels
  
  nodes.forEach((node, index) => {
    // 1. Render Cache Node Card
    const nodeCard = document.createElement('div');
    nodeCard.className = 'cache-node';
    nodeCard.dataset.nodeId = node.visualId;
    
    const isSentinel = node === cache.head || node === cache.tail;
    const addr = `0x${((node.key * 17) & 0xFF).toString(16).toUpperCase().padStart(2, '0')}`;
    
    if (isSentinel) {
      nodeCard.classList.add('sentinel');
      const label = node === cache.head ? 'HEAD' : 'TAIL';
      nodeCard.innerHTML = `
        <span class="node-title">Sentinel</span>
        <span class="node-key-val">${label}</span>
        <span class="node-addr">${node === cache.head ? '0x00' : '0xFF'}</span>
      `;
    } else {
      nodeCard.innerHTML = `
        <span class="node-title">Key : Val</span>
        <span class="node-key-val">${node.key} : ${node.value}</span>
        <span class="node-addr">${addr}</span>
      `;
    }
    
    // Apply dynamic action animations/states
    if (stepData) {
      const { action, params } = stepData;
      
      // Highlight exact nodes that are undergoing operations
      if (params.node && params.node.visualId === node.visualId) {
        if (action === 'remove_call' || action === 'remove_map') {
          nodeCard.classList.add('active-node');
        } else if (action === 'remove_prev_link' || action === 'remove_next_link') {
          nodeCard.classList.add('active-node');
        } else if (action === 'evict_lru') {
          nodeCard.classList.add('evict-node');
        } else if (action === 'insert_new' || action === 'insert_map') {
          nodeCard.classList.add('insert-node');
        } else if (action === 'insert_node_next' || action === 'insert_next_prev' || action === 'insert_head_next' || action === 'insert_node_prev') {
          nodeCard.classList.add('insert-node');
        } else if (action === 'hit') {
          nodeCard.classList.add('accessed-node');
        }
      }
    } else if (lastOperationHighlight && !isSentinel && node.key === lastOperationHighlight.key) {
      if (lastOperationHighlight.action === 'put') {
        nodeCard.classList.add('insert-node');
      } else if (lastOperationHighlight.action === 'get') {
        nodeCard.classList.add('accessed-node');
      }
    }
    
    dllContainer.appendChild(nodeCard);
    
    // 2. Render Pointer Connector between nodes (except after Tail)
    if (index < nodes.length - 1) {
      const nextNode = nodes[index + 1];
      const connector = document.createElement('div');
      connector.className = 'node-connector';
      
      // Draw SVG for forward (next) and backward (prev) links
      connector.innerHTML = `
        <svg viewBox="0 0 50 60">
          <path id="next-${node.visualId}" class="connector-arrow forward-arrow" d="M 5 20 L 45 20 M 35 12 L 45 20 L 35 28" />
          <path id="prev-${nextNode.visualId}" class="connector-arrow backward-arrow" d="M 45 40 L 5 40 M 15 32 L 5 40 L 15 48" />
        </svg>
      `;
      
      // Apply active path highlights to pointer arrow segments
      if (stepData) {
        const { action, params } = stepData;
        
        // Highlight active next links
        if (action === 'insert_node_next' && params.node.visualId === node.visualId) {
          // Setting new node's next link
          setTimeout(() => {
            const path = connector.querySelector('.forward-arrow');
            if (path) path.classList.add('active-next');
          }, 50);
        }
        
        if (action === 'insert_head_next' && node === cache.head) {
          // Setting head's next to the new node
          setTimeout(() => {
            const path = connector.querySelector('.forward-arrow');
            if (path) path.classList.add('active-next');
          }, 50);
        }
        
        // Highlight active prev links
        if (action === 'insert_node_prev' && params.node.visualId === nextNode.visualId) {
          // Setting new node's prev link back to head
          setTimeout(() => {
            const path = connector.querySelector('.backward-arrow');
            if (path) path.classList.add('active-prev');
          }, 50);
        }
        
        if (action === 'insert_next_prev' && nextNode.visualId === params.node.visualId) {
          // Setting node.next's prev back to new node
          setTimeout(() => {
            const path = connector.querySelector('.backward-arrow');
            if (path) path.classList.add('active-prev');
          }, 50);
        }
        
        // Re-linking pointers inside remove operation
        if (action === 'remove_prev_link' && params.node.prev.visualId === node.visualId) {
          setTimeout(() => {
            const path = connector.querySelector('.forward-arrow');
            if (path) path.classList.add('active-next');
          }, 50);
        }
        if (action === 'remove_next_link' && params.node.next.visualId === nextNode.visualId) {
          setTimeout(() => {
            const path = connector.querySelector('.backward-arrow');
            if (path) path.classList.add('active-prev');
          }, 50);
        }
      }
      
      dllContainer.appendChild(connector);
    }
  });
}

// Controller logic for Put
function handlePut() {
  if (currentIterator) {
    log('Wait! An operation is currently executing. Step through or play it to finish.', 'evict');
    return;
  }
  
  const key = parseInt(putKeyInput.value);
  const val = parseInt(putValInput.value);
  
  if (isNaN(key) || isNaN(val)) {
    log('Error: Key and Value must be valid numbers!', 'miss');
    return;
  }
  
  if (key < 1 || key > 99 || val < 1 || val > 999) {
    log('Error: Key must be 1-99, Value must be 1-999.', 'miss');
    return;
  }
  
  // Start PUT generator
  currentOp = { type: 'put', key, val, evictedKey: null };
  currentIterator = cache.put(key, val);
  currentOperationType = 'put';
  
  log(`Starting <strong>PUT(${key}, ${val})</strong> operation.`, 'info');
  
  // Clear inputs
  putKeyInput.value = '';
  putValInput.value = '';
  
  // Set highlight state
  lastOperationHighlight = { key, action: 'put' };
  
  // RUN INSTANTLY!
  handleSkipToEnd();
}

// Controller logic for Get
function handleGet() {
  if (currentIterator) {
    log('Wait! An operation is currently executing. Step through or play it to finish.', 'evict');
    return;
  }
  
  const key = parseInt(getKeyInput.value);
  
  if (isNaN(key)) {
    log('Error: Key must be a valid number!', 'miss');
    return;
  }
  
  if (key < 1 || key > 99) {
    log('Error: Key must be between 1 and 99.', 'miss');
    return;
  }
  
  // Start GET generator
  currentOp = { type: 'get', key, isHit: false };
  currentIterator = cache.get(key);
  currentOperationType = 'get';
  
  log(`Starting <strong>GET(${key})</strong> operation.`, 'info');
  
  getKeyInput.value = '';
  
  // Set highlight state
  lastOperationHighlight = { key, action: 'get' };
  
  // RUN INSTANTLY!
  handleSkipToEnd();
}

// Step one instruction forward in the algorithm
function handleStepForward() {
  if (!currentIterator) return;
  
  const step = currentIterator.next();
  
  if (!step.done) {
    lastStepVal = step.value;
    const { line, description, action } = step.value;
    
    // 1. Highlight line
    highlightCodeLine(line);
    
    // 2. Set explanation
    explanationText.innerHTML = `<strong>Line ${line}:</strong> ${description}`;
    
    // 3. Console log
    let logType = 'info';
    if (action === 'hit') logType = 'hit';
    if (action === 'completed_miss' || action === 'evict_lru') logType = 'miss';
    if (action === 'remove_existing') logType = 'evict';
    
    log(description, logType);
    
    // 4. Render canvas with highlights
    render(step.value);
    
    // 5. Update stats if operation is at dynamic milestones
    if (action === 'hit') {
      stats.hits++;
      updateStats();
      if (currentOp) currentOp.isHit = true;
    } else if (action === 'completed_miss') {
      stats.misses++;
      updateStats();
    } else if (action === 'evict_lru') {
      if (currentOp) currentOp.evictedKey = step.value.params.key;
    }
    
  } else {
    // Iterator has fully completed
    const finalVal = step.value;
    
    // Reset highlights and stepper panel
    cleanupOperation();
    
    log(`Operation completed. Cache is IDLE.`, 'info');
    explanationText.innerHTML = `<strong>Operation Finished!</strong> The cache is now in a stable idle state.`;
  }
}

// Complete the remaining steps instantly without drawing individual delays
function handleSkipToEnd() {
  if (!currentIterator) return;
  
  let step = currentIterator.next();
  let wasHit = false;
  while (!step.done) {
    const { action } = step.value;
    
    // Accumulate stats silently on skips
    if (action === 'hit') {
      stats.hits++;
      wasHit = true;
      if (currentOp) currentOp.isHit = true;
    } else if (action === 'completed_miss') {
      stats.misses++;
    } else if (action === 'evict_lru') {
      if (currentOp) currentOp.evictedKey = step.value.params.key;
    }
    
    step = currentIterator.next();
  }
  
  // If GET was a miss, don't highlight any accessed node
  if (currentOperationType === 'get' && !wasHit) {
    lastOperationHighlight = null;
  }
  
  cleanupOperation();
  updateStats();
  render();
  log(`Operation executed. Cache updated instantly.`, 'info');
  explanationText.innerHTML = `<strong>Operation Completed!</strong> Cache list has been updated instantly.`;
}

// Cleanup and reset states after an operation ends
function cleanupOperation() {
  currentIterator = null;
  currentOperationType = null;
  lastStepVal = null;
  
  highlightCodeLine(0); // clear specific lines
  setStepperInteractive(false);
  
  if (isPlaying) {
    togglePlayPause(); // pause auto-playing
  }
  
  if (currentOp) {
    timelineHistory.push(currentOp);
    currentOp = null;
    updateTimelineUI();
  }
  
  updateStats();
  render();
}

// Controls stepper button active states
function setStepperInteractive(active) {
  btnStep.disabled = !active;
  btnSkip.disabled = !active;
  
  // Disable PUT / GET inputs during execution to avoid race conditions
  btnPut.disabled = active;
  btnGet.disabled = active;
  btnRandom.disabled = active;
  btnClear.disabled = active;
  btnChangeCapacity.disabled = active;
}

// Play / Pause loop
function togglePlayPause() {
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    playPauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
    playPauseText.textContent = 'Pause';
    
    if (currentIterator) {
      autoStepLoop();
    }
  } else {
    playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    playPauseText.textContent = 'Auto Play';
    
    if (playTimeoutId) {
      clearTimeout(playTimeoutId);
      playTimeoutId = null;
    }
  }
}

// Recursively calls handleStepForward with the selected speed delay
function autoStepLoop() {
  if (!isPlaying || !currentIterator) return;
  
  handleStepForward();
  
  // If the operation just ended, currentIterator becomes null
  if (currentIterator) {
    playTimeoutId = setTimeout(autoStepLoop, delay);
  }
}

// Populates random mockup entries to fill/test the cache
function handleRandom() {
  if (currentIterator) return;
  
  const randomKey = Math.floor(Math.random() * 15) + 1; // 1 to 15
  const randomVal = Math.floor(Math.random() * 900) + 100; // 100 to 999
  
  putKeyInput.value = randomKey;
  putValInput.value = randomVal;
  
  log(`Randomize clicked. Selected pair (${randomKey}: ${randomVal}).`, 'info');
  handlePut();
}

// Reset cache, stats, logs
function handleClear() {
  if (currentIterator) return;
  
  const cap = cache ? cache.capacity : 4;
  cache = new LRUCache(cap);
  
  stats.hits = 0;
  stats.misses = 0;
  
  updateStats();
  render();
  
  timelineHistory = [];
  updateTimelineUI();
  
  log(`Cache reset. Capacity initialized to ${cap}.`, 'info');
  explanationText.innerHTML = `<strong>System Reset.</strong> LRU Cache initialized. Map is empty.`;
}

// Show overlay modal
function showCapacityModal() {
  if (currentIterator) return; // ignore mid-operation
  capacityModal.classList.remove('hidden');
  modalCapacityInput.focus();
}

// Read capacity modal start
function handleModalStart() {
  const cap = parseInt(modalCapacityInput.value);
  if (isNaN(cap) || cap < 2 || cap > 10) {
    alert('Please enter a valid capacity between 2 and 10.');
    return;
  }
  
  // Close modal
  capacityModal.classList.add('hidden');
  
  // Allocate LRUCache
  cache = new LRUCache(cap);
  
  // Clear any stats and logs
  stats.hits = 0;
  stats.misses = 0;
  
  timelineHistory = [];
  updateTimelineUI();
  
  updateStats();
  render();
  
  log(`Terminal initialized. LRU Cache size configured to <strong>${cap}</strong> entries.`, 'info');
  explanationText.innerHTML = `<strong>Cache Ready (Size ${cap}).</strong> Perform a <strong>PUT</strong> or <strong>GET</strong> operation. It can run infinite times!`;
}

// Speed slider adjustment
function handleSpeedChange() {
  delay = parseInt(speedRange.value);
  speedValLabel.textContent = delay;
}

// Render timeline UI
function updateTimelineUI() {
  if (timelineHistory.length === 0) {
    timelineEmpty.classList.remove('hidden');
    timelineContent.classList.add('hidden');
    timelineContent.innerHTML = '';
    return;
  }
  
  timelineEmpty.classList.add('hidden');
  timelineContent.classList.remove('hidden');
  timelineContent.innerHTML = '';
  
  timelineHistory.forEach(op => {
    const entry = document.createElement('div');
    entry.className = 'timeline-entry';
    
    if (op.type === 'put') {
      const opText = `<span class="operation">PUT</span>(${op.key}, ${op.val})`;
      const resultText = op.evictedKey !== null 
        ? `<span class="result-arrow">➔</span><span class="evict">EVICT ${op.evictedKey}</span>`
        : '';
      entry.innerHTML = `${opText}${resultText}`;
    } else {
      const opText = `<span class="operation">GET</span>(${op.key})`;
      const resultText = op.isHit
        ? `<span class="result-arrow">➔</span><span class="hit">HIT</span>`
        : `<span class="result-arrow">➔</span><span class="miss">MISS</span>`;
      entry.innerHTML = `${opText}${resultText}`;
    }
    
    timelineContent.appendChild(entry);
  });
  
  // Auto scroll to bottom of the container
  const container = document.querySelector('.timeline-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Copy timeline to clipboard
function handleCopyTimeline() {
  if (timelineHistory.length === 0) return;
  
  const rawText = timelineHistory.map(op => {
    if (op.type === 'put') {
      return op.evictedKey !== null 
        ? `PUT(${op.key}, ${op.val}) -> EVICT ${op.evictedKey}`
        : `PUT(${op.key}, ${op.val})`;
    } else {
      return `GET(${op.key}) -> ${op.isHit ? 'HIT' : 'MISS'}`;
    }
  }).join('\n');
  
  navigator.clipboard.writeText(rawText).then(() => {
    // Show copy feedback
    const copyText = document.getElementById('copy-text');
    const copyIcon = document.getElementById('copy-icon');
    
    if (copyText && copyIcon) {
      const originalText = copyText.textContent;
      copyText.textContent = 'Copied!';
      
      // Temporary checkmark icon
      const originalIconHTML = copyIcon.innerHTML;
      copyIcon.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
      
      setTimeout(() => {
        copyText.textContent = originalText;
        copyIcon.innerHTML = originalIconHTML;
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy timeline: ', err);
  });
}

// Bootstrap application immediately or on DOM load to prevent DOMContentLoaded race conditions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
