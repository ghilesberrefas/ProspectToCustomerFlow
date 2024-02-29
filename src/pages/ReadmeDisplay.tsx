import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import 'github-markdown-css';

const ReadmeDisplay = () => {
    const [markdown, setMarkdown] = useState<string | Promise<string>>('');

    useEffect(() => {
        fetch('README.md')
            .then((res) => res.text())
            .then((md) => {
                setMarkdown(marked.parse(md));
            })
            .catch((error) => {
                console.error('Error fetching README.md:', error);
            });
    }, []);

    return <div dangerouslySetInnerHTML={{ __html: markdown }}  className="flex min-h-screen bg-gray-50 text-gray-800 flex-col p-24  markdown-body">


    </div>
};

export default ReadmeDisplay;
