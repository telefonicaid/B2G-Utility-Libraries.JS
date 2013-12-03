document.addEventListener('DOMContentLoaded', init);

function init() {
  utils.navigation.init();
  
  document.getElementById('back-fade-action').addEventListener('click',
    function backFadeAction(evt) {
      utils.navigation.go('#back-fade');
    }
  );
  document.getElementById('back-fade-back-action').addEventListener('click',
    back);
  
  document.getElementById('bottom-push-action').addEventListener('click', 
    function bottomPushAction(evt) {
      utils.navigation.go('#bottom-push');
    }
  );
  document.getElementById('bottom-push-back-action').addEventListener('click',
    back);
  
  document.getElementById('bottom-slide-action').addEventListener('click', 
    function bottomSlideAction(evt) {
      utils.navigation.go('#bottom-slide');
    }
  );
  document.getElementById('bottom-slide-back-action').addEventListener('click',
    back);
  
  document.getElementById('right-push-action').addEventListener('click', 
    function rightPushAction(evt) {
      utils.navigation.go('#right-push');
    }
  );
  document.getElementById('right-push-back-action').addEventListener('click',
    back);
  
  document.getElementById('right-slide-action').addEventListener('click', 
    function rightSlideAction(evt) {
      utils.navigation.go('#right-slide');
    }
  );
  document.getElementById('right-slide-back-action').addEventListener('click',
    back);
  
  document.getElementById('sequence-action').addEventListener('click',
    function (evt) {
//      utils.navigation.go('#bottom-push', function showBottomSlide() {
        utils.navigation.go('#bottom-slide', function showRightPush() {
          utils.navigation.go('#right-push', function showRightSlide() {
            utils.navigation.go('#right-slide');
          });
        });
//      });
    }
  );
}

function animationEnded() {
  alert('Animation ended');
}

function back() {
  utils.navigation.back(animationEnded);
}
