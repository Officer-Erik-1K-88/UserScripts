

class ItemChildren {
    /** @type Item */
    #item;

    /**
     * 
     * @param {Item} item 
     */
    constructor(item) {
        this.#item = item;
    }

    get item() {
        return this.#item;
    }

    /**
     * 
     * @param {Item} item 
     * @returns 
     */
    contains(item) {
        return this.#item.hasItem(item.id);
    }

    get(id) {
        return this.#item.getItem(id);
    }

    /**
     * Adds Items to this child list.
     * 
     * @param  {...Item} items The Items to add.
     */
    add(...items) {
        for (let i=0; i < items.length; i++) {
            this.#item.addItem(items[i]);
        }
    }
}


class AttrWrapper {
    /** @type HTMLElement */
    #elm;
    constructor(element) {
        this.#elm = element;
    }

    get attributes() {
        return this.#elm.attributes;
    }

    hasAttributes() {
        return this.#elm.hasAttributes();
    }

    hasAttribute(qualifiedName) {
        return this.#elm.hasAttribute(qualifiedName);
    }
    hasAttributeNS(namespace, localName) {
        return this.#elm.hasAttributeNS(namespace, localName);
    }

    getAttributeNames() {
        return this.#elm.getAttributeNames();
    }

    getAttribute(qualifiedName) {
        return this.#elm.getAttribute(qualifiedName);
    }
    getAttributeNode(qualifiedName) {
        return this.#elm.getAttributeNode(qualifiedName);
    }
    getAttributeNS(namespace, localName) {
        return this.#elm.getAttributeNS(namespace, localName);
    }
    getAttributeNodeNS(namespace, localName) {
        return this.#elm.getAttributeNodeNS(namespace, localName);
    }

    setAttribute(qualifiedName, value) {
        this.#elm.setAttribute(qualifiedName, value);
    }
    setAttributeNode(qualifiedName, value) {
        return this.#elm.setAttributeNode(qualifiedName, value);
    }
    setAttributeNS(namespace, localName, value) {
        this.#elm.setAttributeNS(namespace, localName, value);
    }
    setAttributeNodeNS(namespace, localName, value) {
        return this.#elm.setAttributeNodeNS(namespace, localName, value);
    }

    removeAttribute(qualifiedName) {
        this.#elm.removeAttribute(qualifiedName);
    }
    removeAttributeNode(qualifiedName) {
        return this.#elm.removeAttributeNode(qualifiedName);
    }
    removeAttributeNS(namespace, localName) {
        this.#elm.removeAttributeNS(namespace, localName);
    }

    /**
     * 
     * @param {string} qualifiedName 
     * @param {boolean} forced 
     * @returns 
     */
    toggleAttribute(qualifiedName, forced=null) {
        if (forced == null) {
            return this.#elm.toggleAttribute(qualifiedName);
        }
        return this.#elm.toggleAttribute(qualifiedName, forced);
    }
}


class Item {
    static #ITEMCOUNT = 0;
    /** @type HTMLElement */
    #elm;

    /** @type string */
    #icID;

    #items = {};
    #names = [];

    /** @type Item */
    #parent;
    /** @type ItemChildren */
    #children;

    /** @type AttrWrapper */
    #attrs;

    constructor(tag, id="") {
        this.#icID = "ITEM-"+Item.#ITEMCOUNT;
        this.#elm = document.createElement(tag);
        if (id == "") {
            id = this.#icID;
        }
        this.#elm.id = id;
        this.#children = new ItemChildren(this);
        this.#attrs = new AttrWrapper(this.#elm);
        Item.#ITEMCOUNT += 1;
    }

    get id() {
        return this.#elm.id;
    }

    /**
     * @param {string} value 
     */
    set id(value) {
        if (value == "") {
            value = this.#icID;
        }
        const old = this.#elm.id;
        this.#elm.id = value;
        
        this.#parent.replaceItem(this, old);
    }
    
    get baseURI() {
        return this.#elm.baseURI;
    }
    get namespaceURI() {
        return this.#elm.namespaceURI;
    }
    get localName() {
        return this.#elm.localName;
    }

    get nodeName() {
        return this.#elm.nodeName;
    }
    get nodeType() {
        return this.#elm.nodeType;
    }
    get nodeValue() {
        return this.#elm.nodeValue;
    }

    get tagName() {
        return this.#elm.tagName;
    }

    get classList() {
        return this.#elm.classList;
    }

    get attrs() {
        return this.#attrs;
    }

    /**
     * @returns {Item}
     */
    get parent() {
        return this.#parent;
    }

    /**
     * @returns {ItemChildren}
     */
    get children() {
        return this.#children;
    }

    /**
     * 
     * @param {Item} item 
     * @returns {Item}
     */
    addItem(item) {
        if (!this.hasItem(item.id)) {
            this.#names.push(item.id);
            this.#elm.appendChild(item.#elm);
        } else {
            this.#elm.replaceChild(item.#elm, this.#items[item.id].#elm);
        }
        this.#items[item.id] = item;
        item.#parent = this;
        
        return item;
    }

    /**
     * 
     * @param {Item} newItem 
     * @param {string} oldId 
     * @returns {Item} The item with oldId.
     */
    replaceItem(newItem, oldId) {
        const index = this.#names.indexOf(oldId);
        if (index == -1) {
            throw new Error(`Cannot replace the item with id of '${oldId}' as it doesn't exist.`);
        }
        const ret = this.#items[oldId];
        this.#names[index] = newItem.id;
        if (newItem.#elm !== ret.#elm) {
            this.#elm.replaceChild(newItem.#elm, ret.#elm);
        }
        this.#items[oldId] = undefined;
        ret.#parent = null;
        this.#items[newItem.id] = newItem;
        newItem.#parent = this;
        return ret;
    }

    /**
     * 
     * @param {string} id 
     * @returns {Item}
     */
    removeItem(id) {
        if (!this.hasItem(id)) {
            throw new Error(`Cannot remove the item with id of '${id}' as it doesn't exist.`);
        }
        const ret = this.#items[id];
        this.#items[id] = undefined;
        this.#names.splice(this.#names.indexOf(id), 1);
        ret.#parent = null;
        return ret;
    }

    /**
     * 
     * @param {number} index 
     * @returns 
     */
    popItem(index) {
        return this.removeItem(this.#names[index]);
    }

    /**
     * 
     * @param {number} index 
     * @param {Item} item 
     * @returns 
     */
    insertItem(index, item) {
        if (this.hasItem(item.id)) {
            const ind = this.#names.indexOf(item.id);
            this.#names.splice(ind, 1);
        }
        if (index >= this.#names.length) {
            this.#elm.appendChild(item.#elm);
            this.#names.push(item.id);
        } else {
            this.#elm.insertBefore(item.#elm, this.getItem(index).#elm);
            this.#names.splice(index, 0, item.id);
        }
        if (item.#parent !== null) {
            if (item.#parent !== this) {
                item.#parent.removeItem(item.id);
            }
        }
        this.#items[item.id] = item;
        item.#parent = this;
        
        return item;
    }

    /**
     * 
     * @param {string} id 
     * @returns 
     */
    hasItem(id) {
        return this.#names.includes(id);
    }

    /**
     * 
     * @param {number} id 
     * @returns {Item | null}
     */
    getItem(index) {
        const id = this.#names[index];
        if (!this.hasItem(id)) {
            return null;
        }
        return this.#items[id];
    }

    /**
     * 
     * @param {Element[]} selected 
     */
    #convertToItems(selected) {
        return selected.map(element => {
            if (element == null) {
                return null;
            }
            let elm = element;
            const idPath = [];
            while (!this.hasItem(elm.id)) {
                idPath.push(elm.id);
                elm = elm.parentElement;
                if (elm == null) {
                    return null;
                }
            }
            let item = this.getById(elm.id);
            while (idPath.length != 0) {
                item = item.getItem(idPath.pop());
                if (item == null) {
                    return null;
                }
            }
            return item;
        });
    }

    /**
     * 
     * @param {string} selector 
     * @returns {Item | null} 
     */
    querySelector(selector) {
        let element = this.#elm.querySelector(selector);
        return this.#convertToItems([element])[0];
    }

    /**
     * 
     * @param {string} selector 
     * @returns {Item[]}
     */
    querySelectorAll(selector) {
        let elements = this.#elm.querySelectorAll(selector);
        const items = [];
        this.#convertToItems(Array.from(elements)).forEach(item => {
            if (item !== null) {
                items.push(item);
            }
        });
        return items;
    }

    /**
     * 
     * @param {string} id 
     * @return {Item | null}
     */
    getById(id) {
        if (!this.hasItem(id)) {
            return null;
        }
        return this.#items[id];
    }

    /**
     * 
     * @param {string} classNames 
     * @return {Item[]}
     */
    getByClassName(classNames) {
        const ret = [];
        const names = classNames.split(" ");
        this.#names.forEach(name => {
            let item = this.#items[name];
            for (let i=0; i< names.length; i++) {
                if (item.classList.contains(names[i])) {
                    ret.push(item);
                    break;
                }
            }
        });
        return ret;
    }

    /**
     * 
     * @param {string} qualifiedName 
     * @return {Item[]}
     */
    getByTagName(qualifiedName) {
        const ret = [];
        this.#names.forEach(name => {
            let item = this.#items[name];
            if (item.tagName === qualifiedName) {
                ret.push(item);
            }
        });
        return ret;
    }

    /**
     * 
     * @param {string | null} namespace 
     * @param {string} localName 
     * @return {Item[]}
     */
    getByTagNameNS(namespace, localName) {
        const ret = [];
        this.#names.forEach(name => {
            let item = this.#items[name];
            if (item.namespaceURI === namespace && item.localName === localName) {
                ret.push(item);
            }
        });
        return ret;
    }
}


class Section extends Item {
    /**
     * 
     * @param {string} id 
     * @param {string} className 
     */
    constructor(id, className) {
        super("div", id);
        this.classList.add(...className.split(" "));
    }
}


class Options extends Section {
    constructor(id) {
        super(id, "user-widget-options");
    }
}


class Widget extends Section {
    constructor(id) {
        super(id, "user-widget");
    }
}