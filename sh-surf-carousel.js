'use strict';

document.componentRegistry = {};
document.nextId = 0;

class SurfCarousel {

  /**
   * Create a Surf Carousel
   * @param {Object} opts
   */
  constructor(opts) {

    // Count id to allow resizeEnd event
    this.id_resize = 0;

    //// State handler
    // Set initial state
    this.state = {

    };
    this.state = this.mergeSettings(opts || {});

    // Element
    this.state.selector = typeof this.state.selector === 'string' ? document.querySelector(this.state.selector) : this.state.selector;

    // Early throw if selector doesn't exist
    if(this.state.selector === null){
      console.log('error surf selector');
      return false;
    } /*throw new Error('Something wrong with your selector');*/

    // Component Registry for event handling
    this._id = ++document.nextId;
    document.componentRegistry[this._id] = this;

    // Save inner elements
    this.state.innerElements = [].slice.call(this.state.selector.children);

    // Copy of array perPage items
    this.state.perPageDefault = this.state.perPage;

    // Webkit transform property compatibility check
    this.state.transformProperty = this.webkitOrNot();

    // Is it a touch device?
    this.state.isTouchDeviceBool = this.isTouchDevice();

    //'resizeHandler', 'touchstartHandler', 'touchendHandler', 'touchmoveHandler', 'mousedownHandler', 'mouseupHandler', 'mouseleaveHandler', 'mousemoveHandler',
    // Bind all event handlers for referencability
    ['clickHandler','resizeHandler', 'doneResizing'].forEach(method => {
      this[method] = this[method].bind(this);
  });

    // Build markup and apply required styling to elements
    this.init();

  }

  /**
   * Overrides default settings with custom ones
   * @param {Object} options
   * @returns {Object}
   */
  mergeSettings(options) {

    const settings = {
          selector: '.surfcarousel',
          perPage: {
            693: 2,
            871: 3,
            1049: 4
          },
          mode: 'slider',
          classInitialised: 'sc-initialised',
          translateX : 20,
          currentPosition: 0,
          clicks: 0,
          numChilds: 0,
          prev: null,
          prevHTML: '<i class="fa fa-chevron-left"></i>',
          next: null,
          nextHTML: '<i class="fa fa-chevron-right"></i>',
          onInit: () => {},
      onChange: () => {}
  };

    const userSttings = options;
    for (const attrname in userSttings) {
      settings[attrname] = userSttings[attrname];
    }

    return settings;
  }

  /**
   * Check if the device has touch events
   * @returns {boolean}
   */
  isTouchDevice() {

    return !!("ontouchstart" in document.documentElement);

  }

  /**
   * Apply overflow-x auto to the carousel if touch device
   */
  touchDeviceOverflow() {

    let cO = this.state.selector.querySelector('.s-carousel-overflow');

    if(cO && this.isTouchDevice()){

      cO.setAttribute('style','overflow-x:auto;');

    }

    if(cO && window.innerWidth > 693) {

      cO.removeAttribute("style");

    }

  }

  /**
   * Determinates slides number accordingly to clients viewport.
   */
  resolveSlidesNumber() {

    let perPageChanged = false;

    if (typeof this.state.perPageDefault === 'object') {
      for (const viewport in this.state.perPageDefault) {
        if (this.state.perPageDefault.hasOwnProperty(viewport) && window.innerWidth <= viewport) {
          this.state.perPage = this.state.perPageDefault[viewport];
          this.state.translateX = 100 / (this.state.perPageDefault[viewport] || 5);
          perPageChanged = true;
          break;
        }
      }
    }

    if(!perPageChanged){

      this.state.perPage = 5;
      this.state.translateX = 20;

    }

  }

  /**
   * Determine if browser supports unprefixed transform property.
   * Google Chrome since version 26 supports prefix-less transform
   * @returns {string} - Transform property supported by client.
   */
  webkitOrNot() {
    const style = document.documentElement.style;
    if (typeof style.transform === 'string') {
      return 'transform';
    }
    return 'WebkitTransform';
  }

  /**
   * Inits the instance carousel
   */
  init() {

    this.resolveSlidesNumber();
    this.attachEvents();
    this.styleMarkup();
    this.templateComposer();

    // Popover init
    $(".whats-included-popup").popover({
      trigger: 'hover',
      html: true
    });

    // IObserver: you would need https://github.com/franciscosurf/intersection-observer-vanilla-js
    // myAppIO.observe();

    // Show up!
    this.state.selector.classList.add('s-carousel-toggle-active');
    this.state.selector.removeAttribute('style');

    this.state.onInit.call(this);
  }

  /**
   * Adds the styles minified like AirBnB
   */
  styleMarkup() {

    // Styles appended only on first instance
    if(this._id === 1) {

      let styles = document.createElement('style');
      styles.innerHTML = `.s-carousel-overflow{overflow:hidden;}.s-carousel{overflow:visible;font-size:0;white-space:nowrap;transform:translateX(0%);transition:transform 0.45s ease}.s-carousel-container{position:relative;margin-left:-8px;margin-right:-8px}.s-carousel-toggle{opacity:0;transition:opacity 0.75s linear}.s-carousel-toggle-active{opacity:1}.s-carousel--controls-prev,.s-carousel--controls-next{box-shadow:rgba(0,0,0,0.14) 0px 1px 1px 1px !important;position:absolute;top:50%;display:block;transform:translateY(-50%);z-index:1;left:-15px;width:40px;height:40px;background:white;border-radius:50%;text-align:center;vertical-align:middle;line-height:40px;cursor:pointer}.s-carousel--controls-prev>*:first-child,.s-carousel--controls-next>*:first-child{position:relative;z-index:-1;pointer-events: none;}.s-carousel--controls-next{right:-15px;left:auto}.s-layout{display:inline;transition:visibility 1s linear,opacity 1s linear}.s-layout-fade{visibility:hidden!important;opacity:0!important;transition:visibility 0.4s linear,opacity 0.4s linear}.s-layout-photo{width:20%;display:inline-block;vertical-align:top;white-space:normal}@media (max-width:1049px) and (min-width:872px){.s-layout-photo{width:25%!important}}@media (max-width:871px) and (min-width:694px){.s-layout-photo{width:33.3333%!important}}@media (max-width:693px){.s-carousel--controls-next{right:0;}.s-carousel--controls-prev{left:0;}.s-layout-photo{width:50%!important}}.s-layout-photo-p{padding-left:8px;padding-right:8px;width:100%;height:100%}.s-layout-photo-p > * {min-height:inherit!important;margin-bottom:0!important}.s-layout-photo-p-a{width:100%;background-color:transparent;display:block;overflow:hidden}.s-layout-photo-p-a--item{padding-top:125%;background:#484848;width:100%;position:relative}.s-layout-photo-p-a--item-o{position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%}.s-layout-photo-p-a--item-o-image{background-size:cover;background-position:center center;background-repeat:no-repeat;width:100%;height:100%}.s-layout-photo-p-a--item-o-effect{background-image:linear-gradient(-180deg,rgba(0,0,0,0) 3%,black 100%);opacity:.35;position:absolute;height:60%;width:100%;left:0;bottom:0}.s-layout-photo-p-a--item-o-text{position:absolute;bottom:0;left:0;right:0;padding-bottom:22px;padding-left:15px;padding-right:15px}.s-layout-photo-p-a--item-o-text-headline{font-family:"Helvetica Neue",sans-serif;overflow-wrap:break-word;font-size:18px;font-weight:800;line-height:1.44444em;color:white;text-align:center;margin:0}.s-layout-photo-p-a--item-o-text-subheadline{font-family:"Helvetica Neue",sans-serif;overflow-wrap:break-word;font-size:14px;font-weight:600;line-height:1.28571em;color:white;text-align:center;margin:0}.hidden{display:none!important}.s-carousel .discover-properties{top:25px;bottom:auto;}.s-carousel .discover-properties .fa,.s-carousel .discover-spots .fa{font-size:16px!important;}.s-layout span{font-size:14px;}`;
      document.body.appendChild(styles);

    }

  }

  /**
   * Creates a DIV element, adds attributes and if true sets innerHTML
   * @param props
   * @param dataVal
   * @returns {Element}
   */
  buildElement(elemType, props, dataVal) {

    elemType = elemType || 'div';

    dataVal = dataVal || false;

    const elementChild = document.createElement(elemType);
    for(let key in props) {
      if (props.hasOwnProperty(key)) {
        elementChild.setAttribute(key, props[key]);
      }
    }
    if(dataVal !== false)
      elementChild.innerHTML = dataVal;

    return elementChild;
  }

  /**
   * Creates the HTML markup
   */
  templateMarkup() {

    // Change the class on the parent selector
    this.state.selector.setAttribute('class', 's-carousel-container s-carousel-toggle');

    // Need to create the arrows
    const controlPrev = this.buildElement('div', {'class':'s-carousel--controls-prev hidden'}, this.state.prevHTML);
    const controlNext = this.buildElement('div',{'class':'s-carousel--controls-next'}, this.state.nextHTML);

    this.state.selector.appendChild(controlPrev);
    this.state.prev = this.state.selector.querySelector('.s-carousel--controls-prev');
    this.state.selector.appendChild(controlNext);
    this.state.next = this.state.selector.querySelector('.s-carousel--controls-next');

    let isTouch = this.state.isTouchDeviceBool ? 1:0;
    if(isTouch){
      this.state.prev.classList.add('hide');
      this.state.next.classList.add('hide');
    }

    const sCarouselOverflow = this.buildElement('div', {'class':'s-carousel-overflow'}, false);
    this.state.selector.appendChild(sCarouselOverflow);

    // Hide arrows and allow overflow auto
    this.touchDeviceOverflow();

    // We create the s-carousel container which translate by X edge
    const sCarouselTranslated = this.buildElement('div', {'class':'s-carousel','style':'transform: translateX(0%);'}, false);
    // We add it to our carousel
    this.state.selector.querySelector('.s-carousel-overflow').appendChild(sCarouselTranslated);
    this.state.sCarousel = this.state.selector.querySelector('.s-carousel');

    // Add id
    this.state.selector.setAttribute('id', 's-carousel-'+this._id);
    // Add class initialised and toggle-active
    this.state.selector.classList.add(this.state.classInitialised);

  }

  /**
   * Creates the HTML markup
   * @param ownMarkupContent
   * @param _carousel
   * @returns {*}
   */
  templateCarousel(ownMarkupContent, _carousel) {

    // Empty the selector
    this.state.selector.innerHTML = '';
    let isTouch = this.state.isTouchDeviceBool ? '1':'0';

    // If no HTML content, create and append it. Otherwise we keep the one given.
    if(!ownMarkupContent) {

      if(_carousel.length === 0) return false;

      // Creates the containers, structure and arrow buttons (a.k.a new children)
      this.templateMarkup();

      // In this instance, your div elements have been changed from block level elements to inline elements. A typical characteristic of inline elements is that they respect the whitespace in the markup. This explains why a gap of space is generated between the elements. (example)
      // Solution 1: inline all html like here:
      //div.innerHTML = `<div class="s-carousel--controls-prev"><i class="fa fa-chevron-left"></i></div><div class="s-carousel" style="transform: translateX(0%);">${_carousel.map((item, i) => `<span class="s-layout ${i>4 ? 's-layout-fade':'' }"><div class="s-layout-photo"><div class="s-layout-photo-p"><a href="${item.url}" class="s-layout-photo-p-a" aria-busy="false"><div class="s-layout-photo-p-a--item"><div class="s-layout-photo-p-a--item-o"><div class="s-layout-photo-p-a--item-o-image" style="background-image: url(&quot;${item.image}&quot;);"></div><div class="s-layout-photo-p-a--item-o-effect"></div><div class="s-layout-photo-p-a--item-o-text"><div class="s-layout-photo-p-a--item-o-text-headline">${item.heading}</div><div class="s-layout-photo-p-a--item-o-text-subheadline">${item.subheading}</div></div></div></div></a></div></div></span>`.trim()).join('')}</div><div class="s-carousel--controls-next"><i class="fa fa-chevron-right"></i></div>`;
      // Solution 2: put font-size:0 to the parent div over the inline shit.

      // style="background-image: url(&quot;${item.image}&quot;);"
      this.state.sCarousel.innerHTML = `
        ${_carousel.map((item, i) => `
          <span class="s-layout ${i>4 && !this.state.isTouchDeviceBool ? ' s-layout-fade':'' }">
            <div class="s-layout-photo">
              <div class="s-layout-photo-p">
                <a href="${item.url}" class="s-layout-photo-p-a [ tracking-event ]" aria-busy="false">
                  <div class="s-layout-photo-p-a--item">
                    <div class="s-layout-photo-p-a--item-o">
                      ${ (item.places ? item.places:'' ) }
                      ${ (item.spots ? item.spots:'' ) }
                      <div class="s-layout-photo-p-a--item-o-image" data-io-bg="${item.image}"></div>
                      <div class="s-layout-photo-p-a--item-o-effect"></div>
                      <div class="s-layout-photo-p-a--item-o-text">
                        <div class="s-layout-photo-p-a--item-o-text-headline">${item.heading}</div>
                        <div class="s-layout-photo-p-a--item-o-text-subheadline">${item.subheading}</div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </span>
        `.trim()).join('')}
      `;

    }
    else {

      // Creates the containers, structure and arrow buttons (a.k.a new children)
      this.templateMarkup();

      this.state.sCarousel.innerHTML = `
        ${_carousel.map((item, i) => `
          <span class="s-layout ${i>4 && !this.state.isTouchDeviceBool ? ' s-layout-fade':'' }">
            <div class="s-layout-photo">
              <div class="s-layout-photo-p">
                ${item.outerHTML}
              </div>
            </div>
          </span>
        `.trim()).join('')}
      `;

      this.state.numChilds = this.state.innerElements.length;

    }

    return this;
  }

  /**
   * TemplateComposer
   * @description HTML Markup needed: ul li data-image data-url data-heading data-subheading
   */
  templateComposer() {

    let _carousel = [];
    let ownMarkupContent = false;

    let self = this;

    // If it does not have the class initialised, then template it
    if(!this.state.selector.classList.contains(this.state.classInitialised)) {

      if(this.state.mode == 'custom' || this.state.selector.hasAttribute("data-mode")) {

        ownMarkupContent = true;
        this.templateCarousel(ownMarkupContent, this.state.innerElements);
        return this;

      }

      // Template it
      if(this.state.selector.nodeName === 'DIV'){
        //console.log("es UL");

        let children = this.state.selector.childNodes;

        if (children) {

          [].forEach.call(children, function(child) {

            if (child.nodeName === 'DIV') {

              if ( child.hasAttribute('data-image')/* && child.getAttribute("data-image")*/) {
                //console.log("es LI y tiene imagen");
                // Save images
                self.state.numChilds++;
                _carousel.push({
                  image: child.getAttribute('data-image') ? child.getAttribute('data-image'):'',
                  url: child.getAttribute('data-url') ? child.getAttribute('data-url'):'',
                  heading: child.getAttribute('data-heading') ? child.getAttribute('data-heading'):'',
                  subheading: child.getAttribute('data-subheading') ? child.getAttribute('data-subheading'):'',
                  places: child.getAttribute('data-places') ? child.getAttribute('data-places'):'',
                  spots: child.getAttribute('data-spots') ? child.getAttribute('data-spots'):''
                });
              }

              else if (!child.getAttribute("data-image")) {

                // if first child has no data attributes, we assume it is a slider of provided html
                ownMarkupContent = true;
                self.templateCarousel(ownMarkupContent, self.state.innerElements);
                return this;

              }

            }

          });//end foreach child

        } //if children
      }

      if(ownMarkupContent){
        this.templateCarousel(ownMarkupContent, this.state.innerElements);
        return this;
      }

    }

    if(_carousel.length > 0){
      //console.log(_carousel);
      // Process current carousel
      this.templateCarousel(ownMarkupContent, _carousel);
      // Reset carousel
      _carousel = [];
    }

  }

  /**
   * Attach the events
   */
  attachEvents() {

    // Click on arrows
    this.state.selector.addEventListener('click', this.clickHandler);

    // Resize element on window resize
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Click event handler
   * @param event
   */
  clickHandler(event) {

    // Avoid bubble propagation to parents
    // Note: This messes up tracking events in other elements within same parents
    //event.stopPropagation();

    event = event || window.event;
    var target = event.target;

    var classEvent = target.getAttribute('class');
    if(classEvent == null) return;

    // Check if we clicked on PREV arrow
    if(classEvent.match(/(s-carousel--controls-prev)/g)) {
      this.prev();
    }

    // Check if we clicked on NEXT arrow
    else if(classEvent.match(/(s-carousel--controls-next)/g)) {
      this.next();
    }

  }

  /**
   * Next slider
   */
  next() {

    let sCarousel = this.state.sCarousel;

    if(this.state.clicks + this.state.perPage < this.state.numChilds) {
      this.state.clicks++;
      this.state.currentPosition = this.state.currentPosition - this.state.translateX;
      sCarousel.style[this.state.transformProperty] = "translateX("+this.state.currentPosition+"%)";
      var firstIMG = sCarousel.getElementsByClassName('s-layout-fade')[0];
      if(firstIMG)
        firstIMG.classList.remove('s-layout-fade');
    }

    if(this.state.clicks + this.state.perPage >= this.state.numChilds) {
      this.state.next.classList.add('hidden');
    }

    if(this.state.clicks >= 1) {
      this.state.prev.classList.remove('hidden');
    }

  }

  /**
   * Prev slider
   */
  prev() {

    let sCarousel = this.state.sCarousel;

    if(this.state.clicks >= 1) {
      this.state.clicks--;
      this.state.currentPosition = this.state.currentPosition + this.state.translateX;
      sCarousel.style.transform = "translateX("+this.state.currentPosition+"%)";
    }

    // Hide prev arrow if we are on the first
    if(this.state.clicks < 1) {
      this.state.prev.classList.add('hidden');
    }
    // Hide next arrow if we are in the last
    if(this.state.clicks + this.state.perPage < this.state.numChilds){
      this.state.next.classList.remove('hidden');
    }

  }

  doneResizing() {

    // Remove event click
    this.state.selector.removeEventListener('click', this.clickHandler);

    // if no touch device
    // Hide arrows and allow overflow auto
    this.touchDeviceOverflow();

    const perPagePrevious = this.state.perPage;

    // Update perPage number
    this.resolveSlidesNumber();

    const sign = Math.sign(this.state.currentPosition); // % total
    let total = 0;

    // Reached the end of the carousel
    if(this.state.clicks > 0 ) {
      if(perPagePrevious + this.state.clicks === this.state.numChilds) {

        this.state.clicks = this.state.numChilds - this.state.perPage;
        total = this.state.clicks * this.state.translateX * sign;
      }
      else if(this.state.perPage + this.state.clicks < this.state.numChilds) {

        total = this.state.clicks * this.state.translateX * sign;
      }
    }
    else {
      let cO = this.state.selector.querySelector('.s-carousel-overflow');
      if(cO){
        cO.scrollLeft = 0;
      }
    }

    this.state.currentPosition = total;
    this.state.sCarousel.setAttribute('style', 'transform: translateX('+total+'%);');

    this.state.selector.addEventListener('click', this.clickHandler);

    // On resized check if touchable and hide or show arrows
    this.state.isTouchDeviceBool = this.isTouchDevice();
    let isTouch = this.state.isTouchDeviceBool ? 1:0;
    if(isTouch){
      this.state.prev.classList.add('hide');
      this.state.next.classList.add('hide');
    }
    else{
      this.state.prev.classList.remove('hide');
      this.state.next.classList.remove('hide');
    }

  }

  /**
   * Resize End handler
   */
  resizeHandler() {

    clearTimeout(this.id_resize);
    this.id_resize = setTimeout(this.doneResizing, 100);

  }

}

// Run a first time all possible surfcarousels out there.
const surfCarousels = document.querySelectorAll('.surfcarousel:not(.sc-initialised)');
const surfCarouselLength = surfCarousels.length;
if(surfCarouselLength > 0){
  for(let sCItem = 0; sCItem < surfCarouselLength; sCItem++){
    if(surfCarousels[sCItem].childElementCount > 0){
      const surfCarouselInstance = new SurfCarousel({selector:surfCarousels[sCItem]});
    }
    else{
      // Mark as initialised
      surfCarousels[sCItem].classList.add('sc-initialised');
    }
  }
}

// Example 1: custom html content
// HTML Markup needed with custom content (PHP $packages has html content)
// <div class="surfcarousel" style="display:none;">
// {{ $packages }}
// </div>

// Example 2: a only div bg-images carousel using data attributes (data-image is required)
//  <div class="surfcarousel" style="display:none;">
//    @foreach($images as $image)
//      <div data-image="/assets/frontend/images/best_towns/750x340{{ $topSurfTown->town->home_picture }}"
//           data-url="/destinations/{{ $topSurfTown->town->country_slug }}/{{ $topSurfTown->town->slug }}"
//           data-heading="{{ $topSurfTown->town->display_name }}"
//           data-subheading="{{ $topSurfTown->town->country->display_name }}" data-places="{{ $topSurfTown->town->no_of_places }}" data-spots="{{ $topSurfTown->town->no_of_spots }}">
//      </div>
//    @endforeach
//  </div>