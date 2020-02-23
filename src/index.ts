#!/usr/bin/env node

import { generate } from './Command/Generate';
import FileManager from './FileManager';

const generatedClassModels = generate('apex');
new FileManager(generatedClassModels).generate();
