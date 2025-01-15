import { colorManager } from './services/color-manager';
import type { CalendarEvent } from './services/google-calendar/calendar';

// Extend Window interface to include our global properties
declare global {
    interface Window {
        testCases: typeof testCases;
        runAllTests: () => Promise<void>;
        resetTests: () => void;
    }
}

const testCases = [
    {
        name: "No Events",
        time: "14:00",
        events: [] as CalendarEvent[],
        description: "Should show neutral gray"
    },
    {
        name: "Event in 2 hours",
        time: "14:00",
        events: [{
            id: "1",
            summary: "Test Event",
            start: "2025-01-14T16:00:00",
            end: "2025-01-14T17:00:00",
            calendarId: "test"
        }],
        description: "Should show neutral gray"
    },
    {
        name: "Event in 45 minutes",
        time: "14:15",
        events: [{
            id: "2",
            summary: "Test Event",
            start: "2025-01-14T15:00:00",
            end: "2025-01-14T16:00:00",
            calendarId: "test"
        }],
        description: "Should show light blue transition"
    },
    {
        name: "Event in 20 minutes",
        time: "14:40",
        events: [{
            id: "3",
            summary: "Test Event",
            start: "2025-01-14T15:00:00",
            end: "2025-01-14T16:00:00",
            calendarId: "test"
        }],
        description: "Should show medium blue transition"
    },
    {
        name: "Event in 5 minutes",
        time: "14:55",
        events: [{
            id: "4",
            summary: "Test Event",
            start: "2025-01-14T15:00:00",
            end: "2025-01-14T16:00:00",
            calendarId: "test"
        }],
        description: "Should show deep blue transition"
    },
    {
        name: "Current Event",
        time: "15:30",
        events: [{
            id: "5",
            summary: "Test Event",
            start: "2025-01-14T15:00:00",
            end: "2025-01-14T16:00:00",
            calendarId: "test"
        }],
        description: "Should show imminent blue"
    },
    {
        name: "After Hours",
        time: "18:30",
        events: [] as CalendarEvent[],
        description: "Should show soft purple"
    }
];

function createTestCase(test: typeof testCases[0]) {
    const div = document.createElement('div');
    div.className = 'test-case';
    div.innerHTML = `
        <div class="time">${test.name} (${test.time})</div>
        <div class="description">${test.description}</div>
    `;
    return div;
}

function setupTests() {
    const container = document.getElementById('testCases');
    if (!container) return;
    container.innerHTML = '';
    testCases.forEach(test => {
        container.appendChild(createTestCase(test));
    });
}

async function runAllTests() {
    const testCases = document.querySelectorAll('.test-case');
    for (let i = 0; i < window.testCases.length; i++) {
        const test = window.testCases[i];
        const testCase = testCases[i] as HTMLDivElement;
        const [hours, minutes] = test.time.split(':');
        const testDate = new Date(2025, 0, 14);
        testDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        colorManager.enableTestMode({ currentTime: testDate });
        const color = colorManager.getBackgroundColor(test.events);
        testCase.style.backgroundColor = color;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function resetTests() {
    colorManager.disableTestMode();
    const testCases = document.querySelectorAll('.test-case');
    testCases.forEach(testCase => {
        (testCase as HTMLDivElement).style.backgroundColor = '#f5f5f5';
    });
}

// Export for global access
window.testCases = testCases;
window.runAllTests = runAllTests;
window.resetTests = resetTests;

// Setup on load
document.addEventListener('DOMContentLoaded', setupTests);