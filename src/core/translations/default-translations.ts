/**
 * Default English translations for ApexDocs.
 * These can be overridden by users in their configuration.
 */
export type Translations = {
  changelog: {
    title: string;
    newClasses: {
      heading: string;
      description: string;
    };
    newInterfaces: {
      heading: string;
      description: string;
    };
    newEnums: {
      heading: string;
      description: string;
    };
    newCustomObjects: {
      heading: string;
      description: string;
    };
    newTriggers: {
      heading: string;
      description: string;
    };
    removedTypes: {
      heading: string;
      description: string;
    };
    removedCustomObjects: {
      heading: string;
      description: string;
    };
    removedTriggers: {
      heading: string;
      description: string;
    };
    newOrModifiedMembers: {
      heading: string;
      description: string;
    };
    newOrRemovedCustomFields: {
      heading: string;
      description: string;
    };
    newOrRemovedCustomMetadataTypeRecords: {
      heading: string;
      description: string;
    };
    memberModifications: {
      newEnumValue: string;
      removedEnumValue: string;
      newMethod: string;
      removedMethod: string;
      newProperty: string;
      removedProperty: string;
      newField: string;
      removedField: string;
      newType: string;
      removedType: string;
      newCustomMetadataRecord: string;
      removedCustomMetadataRecord: string;
      newTrigger: string;
      removedTrigger: string;
    };
  };
  markdown: {
    sections: {
      methods: string;
      properties: string;
      fields: string;
      constructors: string;
      values: string; // for enums
      classes: string; // for inner classes
      enums: string; // for inner enums
      interfaces: string; // for inner interfaces
      namespace: string;
      records: string; // for custom metadata records
      publishBehavior: string;
    };
    // Field/Property/Method details
    details: {
      type: string;
      signature: string;
      group: string;
      author: string;
      date: string;
      see: string;
      possibleValues: string; // for picklist fields
      parameters: string;
      throws: string;
      returnType: string;
      apiName: string;
      required: string;
      inlineHelpText: string;
      complianceGroup: string;
      securityClassification: string;
      protected: string;
    };
    // Class/Interface/Enum suffixes
    typeSuffixes: {
      class: string;
      interface: string;
      enum: string;
      trigger: string;
    };
    // Trigger events
    triggerEvents: {
      beforeInsert: string;
      beforeUpdate: string;
      beforeDelete: string;
      afterInsert: string;
      afterUpdate: string;
      afterDelete: string;
      afterUndelete: string;
    };
    // Publish behaviors
    publishBehaviors: {
      publishImmediately: string;
      publishAfterCommit: string;
    };
    // Inheritance and implementation
    inheritance: {
      inheritance: string;
      implements: string;
    };
  };
};

export const defaultTranslations: Translations = {
  changelog: {
    title: 'Changelog',
    newClasses: {
      heading: 'New Classes',
      description: 'These classes are new.',
    },
    newInterfaces: {
      heading: 'New Interfaces',
      description: 'These interfaces are new.',
    },
    newEnums: {
      heading: 'New Enums',
      description: 'These enums are new.',
    },
    newCustomObjects: {
      heading: 'New Custom Objects',
      description: 'These custom objects are new.',
    },
    newTriggers: {
      heading: 'New Triggers',
      description: 'These triggers are new.',
    },
    removedTypes: {
      heading: 'Removed Types',
      description: 'These types have been removed.',
    },
    removedCustomObjects: {
      heading: 'Removed Custom Objects',
      description: 'These custom objects have been removed.',
    },
    removedTriggers: {
      heading: 'Removed Triggers',
      description: 'These triggers have been removed.',
    },
    newOrModifiedMembers: {
      heading: 'New or Modified Members in Existing Types',
      description: 'These members have been added or modified.',
    },
    newOrRemovedCustomFields: {
      heading: 'New or Removed Fields to Custom Objects or Standard Objects',
      description: 'These custom fields have been added or removed.',
    },
    newOrRemovedCustomMetadataTypeRecords: {
      heading: 'New or Removed Custom Metadata Type Records',
      description: 'These custom metadata type records have been added or removed.',
    },
    memberModifications: {
      newEnumValue: 'New Enum Value',
      removedEnumValue: 'Removed Enum Value',
      newMethod: 'New Method',
      removedMethod: 'Removed Method',
      newProperty: 'New Property',
      removedProperty: 'Removed Property',
      newField: 'New Field',
      removedField: 'Removed Field',
      newType: 'New Type',
      removedType: 'Removed Type',
      newCustomMetadataRecord: 'New Custom Metadata Record',
      removedCustomMetadataRecord: 'Removed Custom Metadata Record',
      newTrigger: 'New Trigger',
      removedTrigger: 'Removed Trigger',
    },
  },
  markdown: {
    sections: {
      methods: 'Methods',
      properties: 'Properties',
      fields: 'Fields',
      constructors: 'Constructors',
      values: 'Values',
      classes: 'Classes',
      enums: 'Enums',
      interfaces: 'Interfaces',
      namespace: 'Namespace',
      records: 'Records',
      publishBehavior: 'Publish Behavior',
    },
    details: {
      type: 'Type',
      signature: 'Signature',
      group: 'Group',
      author: 'Author',
      date: 'Date',
      see: 'See',
      possibleValues: 'Possible values are',
      parameters: 'Parameters',
      throws: 'Throws',
      returnType: 'Return Type',
      apiName: 'API Name',
      required: 'Required',
      inlineHelpText: 'Inline Help Text',
      complianceGroup: 'Compliance Group',
      securityClassification: 'Security Classification',
      protected: 'Protected',
    },
    typeSuffixes: {
      class: 'Class',
      interface: 'Interface',
      enum: 'Enum',
      trigger: 'Trigger',
    },
    triggerEvents: {
      beforeInsert: 'Before Insert',
      beforeUpdate: 'Before Update',
      beforeDelete: 'Before Delete',
      afterInsert: 'After Insert',
      afterUpdate: 'After Update',
      afterDelete: 'After Delete',
      afterUndelete: 'After Undelete',
    },
    publishBehaviors: {
      publishImmediately: 'Publish Immediately',
      publishAfterCommit: 'Publish After Commit',
    },
    inheritance: {
      inheritance: 'Inheritance',
      implements: 'Implements',
    },
  },
};
