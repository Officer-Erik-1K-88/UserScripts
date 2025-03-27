/**
 * Changes the place the submenu will be placed when parent is hovered.
 * @param {Element} submenu The sub-menu that will be checked.
 */
function changeMenuDirect(submenu) {
    submenu.style.left = "100%";
    submenu.style.right = "auto";
    submenu.style.top = "0";
    submenu.style.bottom = "auto";

    const rect = submenu.getBoundingClientRect();
    const overRight = rect.right > window.innerWidth;
    const overLeft = rect.left < 0;

    if (overRight) {
        submenu.style.left = "auto";
        submenu.style.right = "100%";
    }

    if (overLeft && overRight) {
        submenu.style.left = "0";
        submenu.style.right = "auto";
        submenu.style.top = "100%";
    }
}

// Dynamically position nested submenus
const repositionSubmenus = () => {
    document.querySelectorAll("nav li ul ul").forEach(submenu => {
        changeMenuDirect(submenu);
    });
};

/**
 * 
 * @param {Element} li 
 * @param {Element} submenu 
 */
const toggleActiveMenu = (li, submenu) => {
    if (li.classList.contains("active")) {
        li.classList.remove("active");
        submenu.classList.add("deactive");
    } else {
        li.classList.add("active");
        if (submenu.classList.contains("deactive")) submenu.classList.remove("deactive");
    }
};

class Item {
    #elm = undefined;
    constructor(tag) {
        this.#elm = document.createElement(tag);
    }

    /**
     * Gets the HTMLElement that this Item contains.
     * @returns {HTMLElement}
     */
    get element() {
        return this.#elm;
    }

    /**
     * Changes the element of this Item.
     * 
     * @param {str} newTag The name of the new tag.
     */
    tagChange(newTag) {
        const oldElm = this.element;
        this.#elm = document.createElement(newTag);
        Array.from(oldElm.attributes).forEach(attr => {
            this.element.setAttribute(attr.name, attr.value);
        });
        Array.from(oldElm.childNodes).forEach(child => {
            this.element.appendChild(child);
        });
        const parent = oldElm.parentElement;
        parent.replaceChild(this.element, oldElm);
    }
}

class ItemChildren extends Item {
    #items = {};
    #names = [];

    constructor() {
        super("ul");
    }

    /**
     * Adds NavItems to this child list.
     * 
     * @param  {...NavItem} items The NavItems to add.
     */
    add(...items) {
        for (let i=0; i < items.length; i++) {
            let item = items[i];
            if (!this.#names.includes(item.textContent)) {
                this.#names.push(item.textContent);
                this.element.appendChild(item.element);
            } else {
                this.element.replaceChild(item.element, this.#items[item.textContent].element)
            }
            this.#items[item.textContent] = item;
        }
    }
}

class NavItem extends Item {
    #childItems = undefined;
    #name = "";
    constructor(textContent, link) {
        super("li");
        this.#name = textContent;
        const aTag = document.createElement("a");
        aTag.href = link;
        aTag.textContent = this.#name;
        aTag.classList.add("item");
        this.element.appendChild(aTag);
        this.element.addEventListener("mouseenter", (e) => {
            repositionSubmenus();
            const self = e.target;
            const submenu = Array.from(self.childNodes).find(elm => elm.nodeName === "UL");
            if (submenu) {
                if (submenu.classList.contains("deactive")) submenu.classList.remove("deactive");
            }
        });
        aTag.addEventListener("click", (e) => {
            const link = e.target;
        
            // Remove all selected classes
            document.querySelectorAll(".navigation .selected").forEach(el => el.classList.remove("selected"));
        
            // Add selected to the clicked <li> and its ancestors
            let li = link.parentElement;
            while (li && li.tagName === "LI") {
                li.classList.add("selected");
                li = li.parentElement.closest("li");
            }
        });
    }

    get textContent() {
        return this.#name;
    }

    /**
     * Gets the child items of this item.
     * @returns {ItemChildren | undefined}
     */
    get children() {
        return this.#childItems;
    }

    addChild(...children) {
        if (!this.children) {
            const toggleButton = document.createElement("button");
            this.element.firstElementChild.classList.add("has-submenu");
            toggleButton.classList.add("item", "submenu-toggle");
            toggleButton.textContent = "▶";
            toggleButton.addEventListener("click", (e) => {
                const parentLi = e.target.parentElement;
                const submenu = e.target.nextElementSibling;
                toggleActiveMenu(parentLi, submenu);
            });
            this.element.appendChild(toggleButton);
            this.#childItems = new ItemChildren();
            this.element.appendChild(this.#childItems.element);
        }
        this.children.add(...children);
    }

    select() {
        // Remove all selected classes
        document.querySelectorAll(".navigation .selected").forEach(el => el.classList.remove("selected"));
        // Add selected to this item and its ancestors
        let li = this.element;
        while (li && li.tagName === "LI") {
            li.classList.add("selected");
            li = li.parentElement.closest("li");
        }
    }
}

class PageNav extends Item {
    #items = new ItemChildren();
    constructor() {
        super("nav");
        this.element.appendChild(this.#items.element);
        this.element.classList.add("navigation");
    }

    addItem(...items) {
        this.#items.add(...items);
    }

    /**
     * 
     * @param {HTMLElement} parentElement The element to append this PageNav to.
     */
    appendTo(parentElement) {
        const menuToggle = document.createElement("button");
        const closeMenu = document.createElement("button");
        menuToggle.classList.add('menu-toggle');
        menuToggle.textContent = "☰";
        closeMenu.classList.add('close-menu');
        closeMenu.textContent = "✖";
        menuToggle.addEventListener("click", () => {
            this.element.classList.toggle("active");
            closeMenu.style.display = this.element.classList.contains("active") ? "block" : "none";
        });
        
        closeMenu.addEventListener("click", () => {
            this.element.classList.remove("active");
            closeMenu.style.display = "none";
        });
        parentElement.appendChild(menuToggle);
        parentElement.appendChild(closeMenu);
        parentElement.appendChild(this.element);
    }

    /**
     * Builds a PageNav based on an unordered list.
     * 
     * @param {HTMLUListElement} template The HTMLUListElement that holds a template of the navigation system.
     * @returns The built PageNav.
     */
    static build(template) {
        const pageNav = new PageNav();
        const items = {};
        let selected = undefined;
        Array.from(template.children).forEach(li => {
            const parent = li.dataset.parent;
            const id = li.dataset.id;
            const aTag = li.firstElementChild;
            items[id] = new NavItem(aTag.textContent, aTag.href);
            if (parent == "none") {
                pageNav.addItem(items[id]);
            } else {
                items[parent].addChild(items[id]);
            }
            if (li.dataset.selected === "true") {
                selected = items[id];
            }
        });
        if (selected) {
            selected.select();
        }

        return pageNav;
    }
}

// Build navigation

const template = document.getElementById("navigationTemplate");
const menu = document.getElementById("mainMenu");
const pageNav = PageNav.build(template.firstElementChild);
template.remove();
pageNav.appendTo(menu);

