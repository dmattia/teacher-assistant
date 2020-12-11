// Select our page elements
const myText = document.getElementById("confusionText");
const myRange = document.getElementById("myRange");
const classRange = document.getElementById("classRange");
const scores = firebase.database().ref("/scores");

// Update the current slider value (each time you drag the slider handle)
myRange.oninput = function () {
  scores.child(firebase.auth().currentUser.uid).set(this.value);
};

// Create a anonymous login to identify each user
firebase
  .auth()
  .signInAnonymously()
  .then(function ({ user }) {
    // Start score at neutral 
    scores.child(user.uid).set(0);

    // Keep the current user slidebar up to date
    scores.child(user.uid).on("value", function (snapshot) {
      // Update our slider
      const rating = parseInt(snapshot.val());
      myRange.value = rating;

      // Update our text
      if (rating > -5 && rating < 5) {
        myText.innerHTML = "I am neutral";
      } else if (this.value < -5) {
        myText.innerHTML = `I am ${-rating}% confused`;
      } else {
        myText.innerHTML = `I am ${rating}% digging it`;
      }
    });

    // Bring the slider back towards neutral over time
    setInterval(() => {
      const current = parseInt(myRange.value);
      if (current < 0) {
        scores.child(user.uid).set(current + 1);
      } else if (current > 0) {
        scores.child(user.uid).set(current - 1);
      }
    }, 100 /* milliseconds */);
  });

// Find the class average and update the class slider
scores.on("value", function (snapshot) {
  const ratings = Object.values(snapshot.val());
  const total = ratings.reduce((sum, num) => sum + parseInt(num), 0);
  const average = Math.round(total / ratings.length);
  classRange.value = average;
});
