import { ClassMirrorWrapper } from '../ClassMirrorWrapper';
import { ClassMirrorBuilder } from '../../../../test-helpers/ClassMirrorBuilder';
import { MethodMirrorBuilder } from '../../../../test-helpers/MethodMirrorBuilder';
import { AnnotationBuilder } from '../../../../test-helpers/AnnotationBuilder';

it('should return methods by annotation when they exist', function () {
  const classMirror = new ClassMirrorBuilder()
    .addMethod(new MethodMirrorBuilder().addAnnotation(new AnnotationBuilder().withName('httpget').build()).build())
    .build();

  const classMirrorWrapper = new ClassMirrorWrapper(classMirror);
  const foundMethods = classMirrorWrapper.getMethodsByAnnotation('httpget');

  expect(foundMethods.length).toBe(1);
});
