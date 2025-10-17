// utils/setupSampleData.js
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export async function setupSampleCourses() {
  const sampleCourses = [
    {
      title: "JavaScript Fundamentals",
      description: "Master the basics of JavaScript programming language",
      instructor: "Sarah Johnson",
      duration: "8 hours",
      level: "Beginner",
      category: "Programming",
      rating: 4.6,
      students: 200,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: [
        {
          title: "Introduction to JavaScript",
          description: "Learn what JavaScript is and how it works",
          duration: "20 min",
          order: 1,
          videoUrl: "",
          content: `
            <h2>What is JavaScript?</h2>
            <p>JavaScript is a programming language that enables interactive web pages.</p>
            <h3>Key Features:</h3>
            <ul>
              <li>Client-side scripting</li>
              <li>Dynamic content updates</li>
              <li>Event handling</li>
            </ul>
          `,
          resources: [
            {
              name: "JavaScript Basics PDF",
              type: "pdf",
              url: "#"
            }
          ]
        },
        {
          title: "Variables and Data Types",
          description: "Learn how to store and manipulate data",
          duration: "30 min",
          order: 2,
          videoUrl: "",
          content: `
            <h2>Variables in JavaScript</h2>
            <p>Variables are containers for storing data values.</p>
            <pre><code>let name = "John";
const age = 25;
var isStudent = true;</code></pre>
          `,
          resources: []
        },
        {
          title: "Functions and Scope",
          description: "Understand how functions work in JavaScript",
          duration: "25 min",
          order: 3,
          videoUrl: "",
          content: `
            <h2>JavaScript Functions</h2>
            <p>Functions are reusable blocks of code that perform specific tasks.</p>
            <pre><code>function greet(name) {
  return "Hello, " + name;
}</code></pre>
          `,
          resources: []
        }
      ]
    },
    {
      title: "React.js Complete Guide",
      description: "Build modern web applications with React.js",
      instructor: "Mike Chen",
      duration: "12 hours", 
      level: "Intermediate",
      category: "Web Development",
      rating: 4.8,
      students: 150,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: [
        {
          title: "React Basics",
          description: "Get started with React components and JSX",
          duration: "40 min",
          order: 1,
          videoUrl: "",
          content: `
            <h2>Welcome to React</h2>
            <p>React makes it painless to create interactive UIs.</p>
            <h3>What is JSX?</h3>
            <p>JSX is a syntax extension to JavaScript.</p>
          `,
          resources: []
        },
        {
          title: "State and Props",
          description: "Manage data flow in React applications",
          duration: "50 min",
          order: 2, 
          videoUrl: "",
          content: `
            <h2>Component State</h2>
            <p>State allows components to manage their own data.</p>
            <pre><code>const [count, setCount] = useState(0);</code></pre>
          `,
          resources: []
        }
      ]
    },
    {
      title: "Python for Data Science",
      description: "Learn Python programming for data analysis and visualization",
      instructor: "Dr. Emily Davis",
      duration: "15 hours",
      level: "Beginner", 
      category: "Data Science",
      rating: 4.7,
      students: 180,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: [
        {
          title: "Python Basics",
          description: "Introduction to Python programming",
          duration: "35 min",
          order: 1,
          videoUrl: "",
          content: `
            <h2>Python Programming</h2>
            <p>Python is a versatile language for data science.</p>
            <pre><code>print("Hello, World!")</code></pre>
          `,
          resources: []
        },
        {
          title: "Data Analysis with Pandas",
          description: "Learn to analyze data using Pandas library",
          duration: "60 min",
          order: 2,
          videoUrl: "",
          content: `
            <h2>Pandas DataFrames</h2>
            <p>Pandas provides data structures for efficient data analysis.</p>
            <pre><code>import pandas as pd
df = pd.read_csv('data.csv')</code></pre>
          `,
          resources: []
        }
      ]
    }
  ];

  try {
    for (const course of sampleCourses) {
      const docRef = await addDoc(collection(db, "courses"), course);
      console.log("Course added with ID: ", docRef.id);
    }
    console.log("All sample courses added successfully!");
  } catch (error) {
    console.error("Error adding courses: ", error);
  }
}