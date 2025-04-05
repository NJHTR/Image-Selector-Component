/**
 * 图片选择器类 | Image Selector Class
 * 实现带键盘导航的图片选择功能 | Implements image selection with keyboard navigation
 */
class ImageSelector {
    /**
     * 构造函数 | Constructor
     * 初始化所有必要属性和事件处理器 | Initializes all necessary properties and event handlers
     */
    constructor() {
        // DOM元素引用 | DOM element references
        this.container = document.querySelector('.container'); // 主容器 | Main container
        this.items = document.querySelectorAll('.item'); // 所有图片项 | All image items
        this.border = document.querySelector('.selection-border'); // 选择框 | Selection border
        
        // 状态变量 | State variables
        this.currentIndex = 0; // 当前选中索引 | Current selected index
        this.cols = 3; // 默认列数 | Default column count
        this.activeItem = null; // 当前激活项 | Currently active item
        
        // 绑定事件处理器（避免this问题） | Bind event handlers (to avoid this issues)
        this.boundHandleResize = this.debounce(this.handleResize.bind(this), 100);
        this.boundKeyHandler = this.handleKeyDown.bind(this);
        this.boundMouseHandler = this.handleMouseOver.bind(this);
        
        // 初始化组件 | Initialize component
        this.init();
    }

    /**
     * 初始化方法 | Initialization method
     * 设置组件的基础状态 | Sets up the basic state of the component
     */
    init() {
        this.createCorners(); // 创建选择框四角 | Create selection border corners
        this.setupEventListeners(); // 设置事件监听 | Set up event listeners
        this.activateItem(0); // 默认激活第一个项目 | Activate first item by default
        this.updateColsCount(); // 计算当前列数 | Calculate current column count
    }

    /**
     * 创建选择框四角 | Create selection border corners
     * 动态添加右上和左下角（其他角通过CSS实现） | Dynamically add top-right and bottom-left corners (others via CSS)
     */
    createCorners() {
        ['tr', 'bl'].forEach(type => {
            const corner = document.createElement('div');
            corner.className = `corner-${type}`;
            this.border.appendChild(corner);
        });
    }

    /**
     * 防抖函数 | Debounce function
     * 防止频繁触发事件（如resize） | Prevents frequent event triggering (e.g. resize)
     * @param {Function} func - 要防抖的函数 | Function to debounce
     * @param {number} wait - 等待时间(ms) | Wait time in milliseconds
     * @returns {Function} - 防抖后的函数 | Debounced function
     */
    debounce(func, wait = 100) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * 更新列数计算 | Update column count calculation
     * 根据CSS网格计算当前列数 | Calculates current column count based on CSS grid
     */
    updateColsCount() {
        const gridColumns = getComputedStyle(this.container).gridTemplateColumns;
        this.cols = gridColumns.split(' ')
            .filter(s => s.trim()).length; // 计算有效列数 | Count valid columns
    }

    /**
     * 更新选择框位置 | Update selection border position
     * 根据目标元素定位选择框 | Positions selection border relative to target element
     * @param {HTMLElement} target - 目标DOM元素 | Target DOM element
     */
    updateBorderPosition(target) {
        const rect = target.getBoundingClientRect(); // 目标元素位置 | Target element position
        const containerRect = this.container.getBoundingClientRect(); // 容器位置 | Container position
        
        // 使用transform实现高性能定位 | Use transform for high-performance positioning
        Object.assign(this.border.style, {
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            transform: `translate(
                ${rect.left - containerRect.left}px,
                ${rect.top - containerRect.top}px
            )`
        });
    }

    /**
     * 激活指定项目 | Activate specified item
     * 更新选中状态和UI | Updates selection state and UI
     * @param {number} index - 要激活的项目索引 | Index of item to activate
     */
    activateItem(index) {
        // 移除之前激活项的类名 | Remove active class from previous item
        if (this.activeItem) {
            this.activeItem.classList.remove('active');
        }
        
        // 设置新激活项 | Set new active item
        this.activeItem = this.items[index];
        this.activeItem.classList.add('active');
        this.updateBorderPosition(this.activeItem);
        this.currentIndex = index;
    }

    /**
     * 鼠标悬停事件处理 | Mouse over event handler
     * 使用事件委托处理图片项悬停 | Uses event delegation for image item hover
     * @param {Event} e - 鼠标事件对象 | Mouse event object
     */
    handleMouseOver(e) {
        const item = e.target.closest('.item'); // 查找最近的图片项 | Find closest image item
        if (item) {
            const index = Array.from(this.items).indexOf(item); // 获取索引 | Get index
            if (index !== -1) {
                this.activateItem(index); // 激活项目 | Activate item
            }
        }
    }

    /**
     * 键盘事件处理 | Keyboard event handler
     * 实现键盘导航功能 | Implements keyboard navigation
     * @param {KeyboardEvent} e - 键盘事件对象 | Keyboard event object
     */
    handleKeyDown(e) {
        const { key } = e;
        
        // 键盘操作映射 | Keyboard action mappings
        const keyActions = {
            ArrowUp: () => Math.max(0, this.currentIndex - this.cols), // 上移 | Move up
            ArrowDown: () => Math.min(this.items.length - 1, this.currentIndex + this.cols), // 下移 | Move down
            ArrowLeft: () => Math.max(0, this.currentIndex - 1), // 左移 | Move left
            ArrowRight: () => Math.min(this.items.length - 1, this.currentIndex + 1), // 右移 | Move right
            default: () => this.currentIndex // 默认无操作 | Default no action
        };

        // 计算新索引 | Calculate new index
        const newIndex = (keyActions[key] || keyActions.default)();
        
        // 如果索引变化则更新 | Update if index changed
        if (newIndex !== this.currentIndex) {
            this.activateItem(newIndex);
            // 平滑滚动到视图 | Smooth scroll into view
            this.items[newIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    /**
     * 窗口大小调整处理 | Window resize handler
     * 响应式布局调整 | Responsive layout adjustments
     */
    handleResize() {
        this.updateColsCount(); // 更新列数 | Update column count
        this.updateBorderPosition(this.items[this.currentIndex]); // 重定位选择框 | Reposition selection border
    }

    /**
     * 设置事件监听器 | Set up event listeners
     * 绑定所有必要的事件 | Binds all necessary events
     */
    setupEventListeners() {
        // 使用事件委托优化鼠标事件 | Use event delegation for mouse events
        this.container.addEventListener('mouseover', this.boundMouseHandler);
        // 键盘导航 | Keyboard navigation
        document.addEventListener('keydown', this.boundKeyHandler);
        // 防抖的resize事件 | Debounced resize event
        window.addEventListener('resize', this.boundHandleResize);
    }

    /**
     * 清理方法 | Cleanup method
     * 移除所有事件监听器 | Removes all event listeners
     */
    destroy() {
        window.removeEventListener('resize', this.boundHandleResize);
        this.container.removeEventListener('mouseover', this.boundMouseHandler);
        document.removeEventListener('keydown', this.boundKeyHandler);
    }
}

// 初始化图片选择器 | Initialize image selector
let selector;
document.addEventListener('DOMContentLoaded', () => {
    selector = new ImageSelector();
});

// 全局清理方法（可选） | Global cleanup method (optional)
window.cleanupImageSelector = () => selector?.destroy();