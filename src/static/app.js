document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to unregister a participant from an activity
  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      if (response.ok) {
        fetchActivities();
      } else {
        alert('Failed to unregister participant');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      alert('Failed to unregister participant');
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create card header
        const header = document.createElement("div");
        header.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        activityCard.appendChild(header);

        // Create participants section
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants';

        const participantsTitle = document.createElement('h4');
        participantsTitle.textContent = 'Participants';
        participantsSection.appendChild(participantsTitle);

        const ul = document.createElement('ul');
        ul.className = 'participants-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';

        if (Array.isArray(details.participants) && details.participants.length) {
          details.participants.forEach(p => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.marginBottom = '8px';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = p;
            li.appendChild(nameSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.className = 'delete-participant';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.color = '#d32f2f';
            deleteBtn.style.fontSize = '18px';
            deleteBtn.style.padding = '0 5px';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.addEventListener('click', () => {
              unregisterParticipant(name, p);
            });
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = 'no-participants';
          li.textContent = 'No participants yet';
          ul.appendChild(li);
        }
        participantsSection.appendChild(ul);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
