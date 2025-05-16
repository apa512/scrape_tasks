import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "urlInput", 
    "fieldsList", 
    "metaFieldsList", 
    "resultsContainer", 
    "resultsContent"
  ]

  connect() {
    // Controller connected
  }

  addField(event) {
    event.preventDefault()
    
    const fieldItem = document.createElement("div")
    fieldItem.className = "field-item"
    fieldItem.innerHTML = `
      <div class="mb-1.5">
        <input type="text" name="field_name[]" placeholder="Field Name" 
               class="w-full p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
      </div>
      <div class="flex items-center gap-2">
        <input type="text" name="field_selector[]" placeholder="CSS Selector" 
               class="flex-grow p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
        <button type="button" class="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors" data-action="click->scrape-form#removeField">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    this.fieldsListTarget.appendChild(fieldItem)
    fieldItem.querySelector('input').focus()
  }

  addMetaField(event) {
    event.preventDefault()
    
    const metaFieldItem = document.createElement("div")
    metaFieldItem.className = "meta-field-item flex items-center gap-2"
    metaFieldItem.innerHTML = `
      <input type="text" name="meta_field[]" placeholder="Meta Name (e.g. description)" 
             class="flex-grow p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
      <button type="button" class="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors" data-action="click->scrape-form#removeField">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `
    
    this.metaFieldsListTarget.appendChild(metaFieldItem)
    metaFieldItem.querySelector('input').focus()
  }

  removeField(event) {
    event.preventDefault()
    const item = event.target.closest(".field-item, .meta-field-item")
    
    // Fade out animation
    item.style.opacity = 1;
    item.style.transition = "opacity 150ms ease";
    item.style.opacity = 0;
    
    setTimeout(() => {
      item.remove();
    }, 150);
  }

  resetForm(event) {
    event.preventDefault()
    this.urlInputTarget.value = ""
    
    // Reset fields to just one empty field
    this.fieldsListTarget.innerHTML = `
      <div class="field-item">
        <div class="mb-1.5">
          <input type="text" name="field_name[]" placeholder="Field Name" 
                 class="w-full p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
        </div>
        <div class="flex items-center gap-2">
          <input type="text" name="field_selector[]" placeholder="CSS Selector" 
                 class="flex-grow p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
        </div>
      </div>
    `
    
    // Reset meta fields to just one empty field
    this.metaFieldsListTarget.innerHTML = `
      <div class="meta-field-item">
        <input type="text" name="meta_field[]" placeholder="Meta Name (e.g. description)" 
               class="w-full p-2 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400">
      </div>
    `
    
    // Hide results
    this.resultsContainerTarget.classList.add("hidden")
  }
  
  showLoadingState() {
    const submitBtn = document.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `
    return submitBtn
  }
  
  resetLoadingState(button) {
    button.disabled = false
    button.textContent = 'Extract'
  }

  async submitForm(event) {
    event.preventDefault()
    
    const url = this.urlInputTarget.value
    
    if (!url) {
      alert('Please enter a URL to scrape')
      return
    }
    
    // Get field names and selectors
    const fieldNames = Array.from(document.querySelectorAll("input[name='field_name[]']")).map(input => input.value.trim())
    const fieldSelectors = Array.from(document.querySelectorAll("input[name='field_selector[]']")).map(input => input.value.trim())
    
    // Get meta fields
    const metaFields = Array.from(document.querySelectorAll("input[name='meta_field[]']"))
      .map(input => input.value.trim())
      .filter(value => value !== "")
    
    // Build fields object for API call
    const fields = {}
    
    fieldNames.forEach((name, index) => {
      if (name && fieldSelectors[index]) {
        fields[name] = fieldSelectors[index]
      }
    })
    
    // Add meta fields if present
    if (metaFields.length > 0) {
      fields.meta = metaFields
    }
    
    // Check if we have at least one field to scrape
    if (Object.keys(fields).length === 0) {
      alert('Please add at least one field to scrape')
      return
    }
    
    const submitBtn = this.showLoadingState()
    
    try {
      const response = await fetch("/scrape_tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
        },
        body: JSON.stringify({
          url: url,
          fields: fields
        })
      })
      
      const data = await response.json()
      
      // Reset button state
      this.resetLoadingState(submitBtn)
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to scrape data")
      }
      
      // Format the JSON
      this.resultsContentTarget.textContent = JSON.stringify(data, null, 2)
      
      // Show results
      this.resultsContainerTarget.classList.remove("hidden")
      
      // Scroll to results
      setTimeout(() => {
        this.resultsContainerTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
      
    } catch (error) {
      console.error("Error:", error)
      this.resetLoadingState(submitBtn)
      this.resultsContentTarget.textContent = `Error: ${error.message}`
      this.resultsContainerTarget.classList.remove("hidden")
    }
  }
  
  copyResults(event) {
    event.preventDefault()
    const text = this.resultsContentTarget.textContent
    
    navigator.clipboard.writeText(text).then(() => {
      // Show visual feedback on the button
      const button = event.currentTarget
      const originalText = button.textContent
      button.textContent = 'Copied!'
      button.classList.add('text-teal-500')
      
      setTimeout(() => {
        button.textContent = originalText
        button.classList.remove('text-teal-500')
      }, 2000)
    })
  }
} 