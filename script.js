//constants
const WIDTH_BREAKPOINT = '600px';
const MOBILE_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

// Helper functions
const getPageElements = () => [...document.querySelectorAll('.page')];
const isMobile = () => window.innerWidth <= WIDTH_BREAKPOINT &&  MOBILE_REGEX.test(navigator.userAgent);

function handleNavigation(){
    // navigation constants
    const NAVIGATION_DELAY = 1000;
    const WHEEL_SENSITIVITY = 37.5;
    const SWIPE_SENSITIVITY = 80;

    // navigation state
    let state = {
        activePage : 0,
        navigating: false,
        pages : [],
        touchDelta: 0,
        touchClientY: 0
    }

    // navigation helper functions
    const isLastPage = () => state.activePage >= state.pages.length -1;
    const isFirstPage = () => state.activePage <= 0;
    const setState = newState => {
        state = {...state, ...newState};
    };
    const setActive = pageKey => {
        setState({
            activePage : pageKey,
            pages : state.pages.map((page, index) => ({...page, active : pageKey == index}))
        });
    };
    const createPageObject = DOMElement => ({
        element: DOMElement,
        active: false
    });

    // handles wheel event - navigates to next or previous page according to wheel delta
    function handleWheel(e){
        if (Math.abs(e.deltaY) <= WHEEL_SENSITIVITY) return;

        if (e.deltaY > 0 && !isLastPage()) {
            navigate(state.activePage + 1);
        } else if (e.deltaY < 0 && !isFirstPage()){
            navigate(state.activePage - 1);
        }
    }

    // handles touchstart event - save vertical position of the finger
    function handleTouchStart(e){
        setState({ touchDelta: 0, touchClientY: e.touches[0].clientY });
    }

    // handles touchmove  event - updates the delta of the touch event
    function handleTouchMove(e){
        const diff = e.touches[0].clientY - state.touchClientY;
        setState({ touchDelta: diff });
    }

    // handles touchstart event - navigates to next or previous page according to touch delta, then reset touch related state
    function handleTouchEnd(e){
        if (Math.abs(state.touchDelta) <= SWIPE_SENSITIVITY) return;

        if (state.touchDelta > 0 && !isLastPage()) {
            navigate(state.activePage + 1);
        } else if (state.touchDelta < 0 && !isFirstPage()){
            navigate(state.activePage - 1);
        }
        setState({ touchDelta: 0, touchClientY: 0});
    }

    /**
     * Navigates to the selected page
     *
     * @param {number} to - The page index to navigate to
     */
    function navigate(to){
        if (!state.navigating) {
            setState({navigating: true});
            const prev =  state.pages[state.activePage].element;
            [...prev.children].forEach(child => {
                child.classList.add(child.dataset.leaving);
            });

            setActive(to);
            window.location.hash = to;

            const next =  state.pages[state.activePage].element;
            next.classList.add('active');
            [...next.children].forEach(child => {
                child.style.transitionDuration = `0ms`;
                child.classList.add(child.dataset.entering);
            });

            setTimeout(() => {
                [...prev.children].forEach(child => {
                    child.classList.remove(child.dataset.leaving);
                });
                prev.classList.remove('active');

                next.classList.add('active');
                [...next.children].forEach(child => {
                    child.style.transitionDuration = `${NAVIGATION_DELAY/2}ms`
                    child.classList.remove(child.dataset.entering);
                });


                setState({navigating: false});
            }, NAVIGATION_DELAY / 2);
        }
    }

    /**
     * Setups the navigation module
     * Apply styles needed for the navigation, creates page objects, navigates to the correct page and attach listeners
     *
     */
    function setup(){
        getPageElements().forEach((page, index) => {
            page.classList.add('js-page');
            [...page.children].forEach(child => {
                child.style.transitionDuration = `${NAVIGATION_DELAY/2}ms`
            });
            state.pages.push(createPageObject(page));
        });
        const initialPage = parseInt(window.location.hash.slice(1)) || 0;
        navigate(initialPage);

        document.addEventListener('wheel', handleWheel);
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }

    setup();
}


function init(){
    if (!isMobile()){
        handleNavigation();
    }
}

document.addEventListener('DOMContentLoaded', init);
